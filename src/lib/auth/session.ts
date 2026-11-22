import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions, users } from "@/lib/db/schema";

export const SESSION_COOKIE = "session";
const DAY_MS = 24 * 60 * 60 * 1000;
export const SESSION_TTL_MS = 30 * DAY_MS;
const RENEW_THRESHOLD_MS = 15 * DAY_MS;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessions).values({ id: hashToken(token), userId, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Valida el token de la cookie. Devuelve el usuario o null.
 * Renueva la expiración (sliding session) cuando queda menos de la mitad.
 */
export async function validateSessionToken(token: string) {
  const sessionId = hashToken(token);
  const [row] = await db
    .select({
      session: sessions,
      user: { id: users.id, name: users.name, email: users.email },
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!row) return null;

  const now = Date.now();
  if (row.session.expiresAt.getTime() <= now) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return null;
  }

  if (row.session.expiresAt.getTime() - now < RENEW_THRESHOLD_MS) {
    await db
      .update(sessions)
      .set({ expiresAt: new Date(now + SESSION_TTL_MS) })
      .where(eq(sessions.id, sessionId));
  }

  return row.user;
}

export async function deleteCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
  }
  cookieStore.delete(SESSION_COOKIE);
}
