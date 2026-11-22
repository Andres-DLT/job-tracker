/**
 * Utilidades de fecha. Las fechas "de calendario" (postulación, recordatorios) se guardan
 * como 'YYYY-MM-DD' sin zona horaria; "hoy" se calcula en APP_TIMEZONE para que la web
 * y el cron de recordatorios coincidan.
 */
export const APP_TIMEZONE = process.env.APP_TIMEZONE || "UTC";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isISODate(value: string) {
  if (!ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** Fecha de hoy ('YYYY-MM-DD') en la zona horaria de la app. */
export function todayISO(now = new Date(), timeZone = APP_TIMEZONE) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addDaysISO(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Días entre dos fechas ISO (b - a). */
export function diffDaysISO(a: string, b: string) {
  const ms = Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

const dateFmt = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Formatea una fecha de calendario 'YYYY-MM-DD'. */
export function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return dateFmt.format(new Date(`${iso}T00:00:00Z`));
}

const dateTimeFmt = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: APP_TIMEZONE,
});

export function formatDateTime(date: Date) {
  return dateTimeFmt.format(date);
}

/** "hoy", "mañana", "en 3 días", "hace 2 días"… relativo a hoy. */
export function relativeDay(iso: string, today = todayISO()) {
  const diff = diffDaysISO(today, iso);
  if (diff === 0) return "hoy";
  if (diff === 1) return "mañana";
  if (diff === -1) return "ayer";
  return diff > 0 ? `en ${diff} días` : `hace ${-diff} días`;
}
