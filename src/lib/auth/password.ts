import "server-only";
import bcrypt from "bcryptjs";

const ROUNDS = 12;

export function hashPassword(password: string) {
  return bcrypt.hash(password, ROUNDS);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// Hash válido de una contraseña aleatoria: se usa para comparar cuando el email
// no existe, de modo que la respuesta tarde lo mismo y no revele qué cuentas existen.
export const DUMMY_HASH = "$2b$12$K5B1kotEvBdfhhJRngQ8Le1f9aN8gSESNGeWmqOwehJEazB2crvqK";
