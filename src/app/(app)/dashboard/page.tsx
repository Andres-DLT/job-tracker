import type { Metadata } from "next";
import Link from "next/link";
import { BellIcon, PlusIcon } from "@/components/icons";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/dal";
import { formatDate, formatDateTime, relativeDay } from "@/lib/dates";
import { getDashboard } from "@/lib/queries";
import { APPLICATION_STATUSES, STATUS_META } from "@/lib/status";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Resumen" };

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboard(user.id);
  const { byStatus, total, today } = data;
  const active = byStatus.applied + byStatus.interviewing;

  const stats = [
    { label: "Postulaciones", value: total, hint: `${data.sent} enviadas` },
    { label: "En curso", value: active, hint: "Postulado + entrevistas" },
    { label: "Entrevistas", value: byStatus.interviewing, hint: "Procesos abiertos" },
    {
      label: "Tasa de respuesta",
      value: data.responseRate === null ? "—" : `${data.responseRate}%`,
      hint: "Entrevista, oferta o rechazo",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Hola, {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-muted">Así va tu búsqueda de empleo.</p>
        </div>
        <Link href="/applications/new" className="btn btn-primary">
          <PlusIcon /> Nueva postulación
        </Link>
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <dt className="text-sm text-muted">{s.label}</dt>
            <dd className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">{s.value}</dd>
            <dd className="mt-1 text-xs text-muted">{s.hint}</dd>
          </div>
        ))}
      </dl>

      <section className="card p-5">
        <h2 className="font-semibold">Embudo por estado</h2>
        {total === 0 ? (
          <p className="mt-3 text-sm text-muted">Aún no hay postulaciones.</p>
        ) : (
          <>
            <div className="mt-4 flex h-3 gap-0.5 overflow-hidden rounded-full" role="img" aria-label="Distribución por estado">
              {APPLICATION_STATUSES.filter((s) => byStatus[s] > 0).map((s) => (
                <div
                  key={s}
                  className={STATUS_META[s].dot}
                  style={{ width: `${(byStatus[s] / total) * 100}%` }}
                  title={`${STATUS_META[s].label}: ${byStatus[s]}`}
                />
              ))}
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-6">
              {APPLICATION_STATUSES.map((s) => (
                <li key={s}>
                  <Link
                    href={`/applications?view=list&status=${s}`}
                    className="flex items-center justify-between gap-2 rounded-md text-sm hover:text-primary"
                  >
                    <span className="flex items-center gap-2 text-muted">
                      <span className={cn("size-2 rounded-full", STATUS_META[s].dot)} />
                      {STATUS_META[s].label}
                    </span>
                    <span className="font-medium tabular-nums">{byStatus[s]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <BellIcon className="text-muted" /> Próximos recordatorios
          </h2>
          {data.upcoming.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              No tienes recordatorios en los próximos 14 días. Puedes crearlos desde la ficha de
              cada postulación.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {data.upcoming.map((r) => {
                const overdue = r.dueOn < today;
                return (
                  <li key={r.id} className="py-3">
                    <Link href={`/applications/${r.applicationId}`} className="group block">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-medium group-hover:text-primary">
                          {r.position} · <span className="text-muted">{r.company}</span>
                        </span>
                        <span
                          className={cn(
                            "shrink-0 text-xs",
                            overdue
                              ? "font-medium text-amber-700 dark:text-amber-300"
                              : "text-muted",
                          )}
                          title={formatDate(r.dueOn)}
                        >
                          {relativeDay(r.dueOn, today)}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted">{r.message}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <h2 className="font-semibold">Actividad reciente</h2>
          {data.activity.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Tu actividad aparecerá aquí.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {data.activity.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <Link href={`/applications/${a.applicationId}`} className="min-w-0 hover:text-primary">
                    <span className="block truncate text-sm font-medium">
                      {a.position} · <span className="text-muted">{a.company}</span>
                    </span>
                    <span className="text-xs text-muted">
                      {a.fromStatus ? "Cambió a" : "Creada como"} · {formatDateTime(a.changedAt)}
                    </span>
                  </Link>
                  <StatusBadge status={a.toStatus} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
