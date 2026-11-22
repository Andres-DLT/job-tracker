import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteApplication } from "@/actions/applications";
import { deleteReminder } from "@/actions/reminders";
import { ConfirmButton } from "@/components/confirm-button";
import { ArrowLeftIcon, BellIcon, CheckIcon, ExternalLinkIcon, PencilIcon, TrashIcon } from "@/components/icons";
import { ReminderForm } from "@/components/reminder-form";
import { StatusBadge } from "@/components/status-badge";
import { StatusSelect } from "@/components/status-select";
import { requireUser } from "@/lib/dal";
import { formatDate, formatDateTime, relativeDay, todayISO } from "@/lib/dates";
import { getApplication } from "@/lib/queries";
import { STATUS_META } from "@/lib/status";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/applications/[id]">): Promise<Metadata> {
  const user = await requireUser();
  const data = await getApplication(user.id, (await params).id);
  return { title: data ? `${data.application.position} · ${data.application.company}` : "No encontrada" };
}

export default async function ApplicationPage({ params }: PageProps<"/applications/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const data = await getApplication(user.id, id);
  if (!data) notFound();

  const { application: app, history, reminders } = data;
  const today = todayISO();

  const details = [
    { label: "Ubicación", value: app.location },
    { label: "Salario", value: app.salary },
    { label: "Fecha de postulación", value: app.appliedOn ? formatDate(app.appliedOn) : null },
    { label: "Contacto", value: app.contact },
  ];

  return (
    <div className="space-y-6">
      <Link href="/applications" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeftIcon /> Postulaciones
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">{app.position}</h1>
          <p className="mt-1 text-muted">{app.company}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusSelect id={app.id} status={app.status} />
          <Link href={`/applications/${app.id}/edit`} className="btn btn-secondary">
            <PencilIcon /> Editar
          </Link>
          <ConfirmButton
            action={deleteApplication.bind(null, app.id)}
            confirmText={`¿Eliminar la postulación a ${app.position} en ${app.company}? Se borrarán también sus recordatorios.`}
            className="btn-danger px-2.5"
            label="Eliminar postulación"
          >
            <TrashIcon />
          </ConfirmButton>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="font-semibold">Detalles</h2>
            <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {details.map((d) => (
                <div key={d.label}>
                  <dt className="text-xs text-muted">{d.label}</dt>
                  <dd className="mt-0.5 text-sm break-words">{d.value || <span className="text-muted">—</span>}</dd>
                </div>
              ))}
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted">Oferta</dt>
                <dd className="mt-0.5 text-sm">
                  {app.jobUrl ? (
                    <a
                      href={app.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-full items-center gap-1.5 text-primary hover:underline"
                    >
                      <span className="truncate">{app.jobUrl.replace(/^https?:\/\//, "")}</span>
                      <ExternalLinkIcon className="shrink-0" width={13} height={13} />
                    </a>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </dd>
              </div>
            </dl>
          </section>

          <section className="card p-5">
            <h2 className="font-semibold">Notas</h2>
            {app.notes ? (
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{app.notes}</p>
            ) : (
              <p className="mt-3 text-sm text-muted">
                Sin notas.{" "}
                <Link href={`/applications/${app.id}/edit`} className="text-primary hover:underline">
                  Añadir
                </Link>
              </p>
            )}
          </section>

          <section className="card p-5">
            <h2 className="font-semibold">Historial</h2>
            <ol className="mt-4 space-y-4 border-l border-border pl-5">
              {history.map((h) => (
                <li key={h.id} className="relative">
                  <span
                    className={cn(
                      "absolute top-1.5 -left-[25px] size-2.5 rounded-full ring-4 ring-surface",
                      STATUS_META[h.toStatus].dot,
                    )}
                  />
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    {h.fromStatus ? (
                      <>
                        <StatusBadge status={h.fromStatus} />
                        <span className="text-muted">→</span>
                        <StatusBadge status={h.toStatus} />
                      </>
                    ) : (
                      <>
                        <span>Creada como</span>
                        <StatusBadge status={h.toStatus} />
                      </>
                    )}
                  </div>
                  <time className="mt-1 block text-xs text-muted" dateTime={h.changedAt.toISOString()}>
                    {formatDateTime(h.changedAt)}
                  </time>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-semibold">
              <BellIcon className="text-muted" /> Recordatorios
            </h2>
            <p className="mt-1 mb-4 text-xs text-muted">
              Te enviaremos un email a {user.email} el día que elijas.
            </p>
            <ReminderForm applicationId={app.id} today={today} />

            {reminders.length > 0 && (
              <ul className="mt-5 divide-y divide-border border-t border-border">
                {reminders.map((r) => (
                  <li key={r.id} className="flex items-start gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm", r.sentAt && "text-muted line-through")}>{r.message}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {r.sentAt ? (
                          <span className="inline-flex items-center gap-1">
                            <CheckIcon width={12} height={12} /> Enviado · {formatDate(r.dueOn)}
                          </span>
                        ) : (
                          <span className={cn(r.dueOn < today && "font-medium text-amber-700 dark:text-amber-300")}>
                            {formatDate(r.dueOn)} · {relativeDay(r.dueOn, today)}
                          </span>
                        )}
                      </p>
                    </div>
                    <ConfirmButton
                      action={deleteReminder.bind(null, r.id)}
                      confirmText="¿Eliminar este recordatorio?"
                      className="btn-ghost -mr-1.5 px-1.5 py-1"
                      label="Eliminar recordatorio"
                    >
                      <TrashIcon width={14} height={14} />
                    </ConfirmButton>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="px-1 text-xs text-muted">
            Creada {formatDateTime(app.createdAt)} · Actualizada {formatDateTime(app.updatedAt)}
          </p>
        </aside>
      </div>
    </div>
  );
}
