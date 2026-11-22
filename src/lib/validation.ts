import { z } from "zod";
import { APPLICATION_STATUSES } from "@/lib/db/schema";
import { isISODate } from "@/lib/dates";

/** Estado que devuelven las Server Actions de formularios. */
export type FormState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: Record<string, string>;
};

export function formValues(formData: FormData, keys: readonly string[]) {
  const values: Record<string, string> = {};
  for (const key of keys) {
    const v = formData.get(key);
    values[key] = typeof v === "string" ? v : "";
  }
  return values;
}

/** Texto opcional: "" se guarda como null. */
const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} admite como máximo ${max} caracteres`)
    .transform((v) => (v === "" ? null : v));

function normalizeUrl(value: string) {
  if (value === "") return value;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
  } catch {
    return false;
  }
}

// ---------- Auth ----------

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Introduce un email válido").max(254, "Email demasiado largo"));

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Tu nombre es obligatorio").max(80, "Máximo 80 caracteres"),
  email,
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72, "La contraseña admite como máximo 72 caracteres"),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Introduce tu contraseña"),
});

// ---------- Postulaciones ----------

export const APPLICATION_FIELDS = [
  "company",
  "position",
  "status",
  "location",
  "jobUrl",
  "salary",
  "contact",
  "appliedOn",
  "notes",
] as const;

export const applicationSchema = z.object({
  company: z.string().trim().min(1, "La empresa es obligatoria").max(120, "Máximo 120 caracteres"),
  position: z.string().trim().min(1, "El puesto es obligatorio").max(120, "Máximo 120 caracteres"),
  status: z.enum(APPLICATION_STATUSES, "Estado no válido"),
  location: optionalText(120, "La ubicación"),
  jobUrl: z
    .string()
    .trim()
    .max(2000, "URL demasiado larga")
    .transform(normalizeUrl)
    .refine((v) => v === "" || isHttpUrl(v), "Introduce una URL válida")
    .transform((v) => (v === "" ? null : v)),
  salary: optionalText(60, "El salario"),
  contact: optionalText(200, "El contacto"),
  appliedOn: z
    .string()
    .trim()
    .refine((v) => v === "" || isISODate(v), "Fecha no válida")
    .transform((v) => (v === "" ? null : v)),
  notes: optionalText(5000, "Las notas"),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

// ---------- Recordatorios ----------

export const reminderSchema = z.object({
  dueOn: z.string().trim().refine(isISODate, "Elige una fecha válida"),
  message: z
    .string()
    .trim()
    .min(1, "Escribe qué quieres recordar")
    .max(500, "Máximo 500 caracteres"),
});
