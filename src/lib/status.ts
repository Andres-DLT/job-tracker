import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/db/schema";

export { APPLICATION_STATUSES, type ApplicationStatus };

type StatusMeta = {
  label: string;
  description: string;
  /** Clases de la insignia (deben ser literales completos para que Tailwind las detecte). */
  badge: string;
  /** Color del punto/barra. */
  dot: string;
};

export const STATUS_META: Record<ApplicationStatus, StatusMeta> = {
  wishlist: {
    label: "Por postular",
    description: "Ofertas guardadas a las que aún no te has postulado",
    badge: "bg-slate-500/10 text-slate-700 ring-slate-500/25 dark:text-slate-300",
    dot: "bg-slate-400",
  },
  applied: {
    label: "Postulado",
    description: "Solicitud enviada, esperando respuesta",
    badge: "bg-blue-500/10 text-blue-700 ring-blue-500/25 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  interviewing: {
    label: "Entrevistas",
    description: "En proceso de entrevistas o pruebas",
    badge: "bg-amber-500/10 text-amber-800 ring-amber-500/30 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  offer: {
    label: "Oferta",
    description: "Has recibido una oferta",
    badge: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Rechazado",
    description: "La empresa descartó la candidatura",
    badge: "bg-rose-500/10 text-rose-700 ring-rose-500/25 dark:text-rose-300",
    dot: "bg-rose-500",
  },
  withdrawn: {
    label: "Retirado",
    description: "Retiraste tu candidatura",
    badge: "bg-zinc-500/10 text-zinc-600 ring-zinc-500/25 dark:text-zinc-400",
    dot: "bg-zinc-400",
  },
};

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return typeof value === "string" && (APPLICATION_STATUSES as readonly string[]).includes(value);
}
