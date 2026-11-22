"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { applications, reminders } from "@/lib/db/schema";
import { requireUser } from "@/lib/dal";
import { todayISO } from "@/lib/dates";
import { isUuid } from "@/lib/utils";
import { formValues, reminderSchema, type FormState } from "@/lib/validation";

export async function createReminder(
  applicationId: string,
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const values = formValues(formData, ["dueOn", "message"]);
  const parsed = reminderSchema.safeParse(values);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }
  if (parsed.data.dueOn < todayISO()) {
    return { fieldErrors: { dueOn: ["La fecha no puede estar en el pasado"] }, values };
  }

  const [app] = isUuid(applicationId)
    ? await db
        .select({ id: applications.id })
        .from(applications)
        .where(and(eq(applications.id, applicationId), eq(applications.userId, user.id)))
    : [];
  if (!app) return { message: "No se encontró la postulación", values };

  await db.insert(reminders).values({ ...parsed.data, applicationId: app.id, userId: user.id });

  revalidatePath("/", "layout");
  return { ok: true, message: "Recordatorio programado" };
}

export async function deleteReminder(id: string) {
  const user = await requireUser();
  if (!isUuid(id)) return;
  await db.delete(reminders).where(and(eq(reminders.id, id), eq(reminders.userId, user.id)));
  revalidatePath("/", "layout");
}
