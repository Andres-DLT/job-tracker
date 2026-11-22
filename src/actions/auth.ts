"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { DUMMY_HASH, hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteCurrentSession } from "@/lib/auth/session";
import { formValues, loginSchema, registerSchema, type FormState } from "@/lib/validation";

function isUniqueViolation(err: unknown) {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === "23505" || e?.cause?.code === "23505";
}

export async function register(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const values = formValues(formData, ["name", "email"]);
  const parsed = registerSchema.safeParse({ ...values, password: formData.get("password") ?? "" });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const { name, email, password } = parsed.data;
  let userId: string;
  try {
    const [user] = await db
      .insert(users)
      .values({ name, email, passwordHash: await hashPassword(password) })
      .returning({ id: users.id });
    userId = user.id;
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { fieldErrors: { email: ["Ya existe una cuenta con este email"] }, values };
    }
    throw err;
  }

  await createSession(userId);
  redirect("/dashboard");
}

export async function login(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const values = formValues(formData, ["email"]);
  const parsed = loginSchema.safeParse({ ...values, password: formData.get("password") ?? "" });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const [user] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);

  // Siempre se compara un hash para no revelar qué emails están registrados.
  const valid = await verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) {
    return { message: "Email o contraseña incorrectos", values };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await deleteCurrentSession();
  redirect("/login");
}
