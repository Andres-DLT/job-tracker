import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Reutiliza el pool entre recargas en desarrollo y entre invocaciones en serverless.
const globalForDb = globalThis as unknown as { pgPool?: Pool };

function createDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Falta la variable de entorno DATABASE_URL");
  }
  const pool = globalForDb.pgPool ?? new Pool({ connectionString, max: 5 });
  if (process.env.NODE_ENV !== "production") globalForDb.pgPool = pool;
  return drizzle(pool, { schema });
}

type Database = ReturnType<typeof createDb>;
let instance: Database | undefined;

/**
 * Cliente de Drizzle. Se inicializa en el primer uso (no al importar), así el build
 * no necesita conexión a la base de datos.
 */
export const db = new Proxy({} as Database, {
  get(_target, prop) {
    instance ??= createDb();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
