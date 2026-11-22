"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { applications, statusChanges } from "@/lib/db/schema";
import { requireUser } from "@/lib/dal";
import { isApplicationStatus } from "@/lib/status";
import { isUuid } from "@/lib/utils";
import {
  APPLICATION_FIELDS,
  applicationSchema,
  formValues,
  type FormState,
} from "@/lib/validation";

function parseApplication(formData: FormData) {
  const values = formValues(formData, APPLICATION_FIELDS);
  const parsed = applicationSchema.safeParse(values);
  return { values, parsed };
}

export async function createApplication(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const { values, parsed } = parseApplication(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const id = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(applications)
      .values({ ...parsed.data, userId: user.id })
      .returning({ id: applications.id, status: applications.status });
    await tx
      .insert(statusChanges)
      .values({ applicationId: created.id, fromStatus: null, toStatus: created.status });
    return created.id;
  });

  revalidatePath("/", "layout");
  redirect(`/applications/${id}`);
}

export async function updateApplication(
  id: string,
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  if (!isUuid(id)) notFound();
  const { values, parsed } = parseApplication(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const found = await db.transaction(async (tx) => {
    const [current] = await tx
      .select({ status: applications.status })
      .from(applications)
      .where(and(eq(applications.id, id), eq(applications.userId, user.id)))
      .for("update");
    if (!current) return false;

    await tx.update(applications).set(parsed.data).where(eq(applications.id, id));
    if (current.status !== parsed.data.status) {
      await tx
        .insert(statusChanges)
        .values({ applicationId: id, fromStatus: current.status, toStatus: parsed.data.status });
    }
    return true;
  });
  if (!found) notFound();

  revalidatePath("/", "layout");
  redirect(`/applications/${id}`);
}

/** Cambio rápido de estado (tablero y selector de la ficha). */
export async function updateApplicationStatus(
  id: string,
  status: string,
): Promise<{ ok: boolean; message?: string }> {
  const user = await requireUser();
  if (!isUuid(id) || !isApplicationStatus(status)) {
    return { ok: false, message: "Datos no válidos" };
  }

  const found = await db.transaction(async (tx) => {
    const [current] = await tx
      .select({ status: applications.status })
      .from(applications)
      .where(and(eq(applications.id, id), eq(applications.userId, user.id)))
      .for("update");
    if (!current) return false;
    if (current.status === status) return true;

    await tx.update(applications).set({ status }).where(eq(applications.id, id));
    await tx
      .insert(statusChanges)
      .values({ applicationId: id, fromStatus: current.status, toStatus: status });
    return true;
  });

  if (!found) return { ok: false, message: "No se encontró la postulación" };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteApplication(id: string) {
  const user = await requireUser();
  if (isUuid(id)) {
    await db
      .delete(applications)
      .where(and(eq(applications.id, id), eq(applications.userId, user.id)));
  }
  revalidatePath("/", "layout");
  redirect("/applications");
}
