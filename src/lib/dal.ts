import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, validateSessionToken } from "@/lib/auth/session";

export type CurrentUser = { id: string; name: string; email: string };

/** Usuario de la petición actual (memoizado por petición). */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return validateSessionToken(token);
});

/** Igual que getCurrentUser, pero redirige a /login si no hay sesión válida. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
