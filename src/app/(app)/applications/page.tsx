import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Board } from "@/components/board";
import { BellIcon, ColumnsIcon, ListIcon, PlusIcon, SearchIcon } from "@/components/icons";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/dal";
import { formatDate, todayISO } from "@/lib/dates";
import { listApplications } from "@/lib/queries";
import { APPLICATION_STATUSES, STATUS_META, isApplicationStatus } from "@/lib/status";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Postulaciones" };

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() || undefined;
}

export default async function ApplicationsPage({ searchParams }: PageProps<"/applications">) {
  const user = await requireUser();
  const params = await searchParams;
  const view = first(params.view) === "list" ? "list" : "board";
  const q = first(params.q)?.slice(0, 100);
  const statusParam = first(params.status);
  const status = view === "list" && isApplicationStatus(statusParam) ? statusParam : undefined;

  const items = await listApplications(user.id, { q, status });
  const today = todayISO();
  const filtered = Boolean(q || status);

  const viewHref = (v: "board" | "list") => {
    const sp = new URLSearchParams();
    if (v === "list") sp.set("view", "list");
    if (q) sp.set("q", q);
    if (v === "list" && status) sp.set("status", status);
    const qs = sp.toString();
    return qs ? `/applications?${qs}` : "/applications";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Postulaciones</h1>
          <p className="mt-1 text-sm text-muted">
            {view === "board"
              ? "Arrastra las tarjetas entre columnas para actualizar su estado."
              : "Todas tus postulaciones, de la más reciente a la más antigua."}
          </p>
        </div>
        <Link href="/applications/new" className="btn btn-primary">
          <PlusIcon /> Nueva postulación
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-border bg-surface p-0.5" role="group" aria-label="Vista">
          {(["board", "list"] as const).map((v) => (
            <Link
              key={v}
              href={viewHref(v)}
              aria-current={view === v ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                view === v ? "bg-surface-muted text-foreground" : "text-muted hover:text-foreground",
              )}
            >
              {v === "board" ? <ColumnsIcon /> : <ListIcon />}
              {v === "board" ? "Tablero" : "Lista"}
            </Link>
          ))}
        </div>

        <Form action="/applications" className="flex flex-1 flex-wrap items-center gap-2">
          {view === "list" && <input type="hidden" name="view" value="list" />}
          <label className="relative min-w-48 flex-1 sm:max-w-xs">
            <span className="sr-only">Buscar</span>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
            <input
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Buscar empresa o puesto"
              className="input pl-9"
            />
          </label>
          {view === "list" && (
            <label>
              <span className="sr-only">Estado</span>
              <select name="status" defaultValue={status ?? ""} className="input w-auto">
                <option value="">Todos los estados</option>
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button type="submit" className="btn btn-secondary">
            Filtrar
          </button>
          {filtered && (
            <Link href={view === "list" ? "/applications?view=list" : "/applications"} className="btn btn-ghost">
              Limpiar
            </Link>
          )}
        </Form>
      </div>

      {items.length === 0 && !filtered ? (
        <EmptyState />
      ) : view === "board" ? (
        <Board items={items} today={today} />
      ) : items.length === 0 ? (
        <p className="card p-8 text-center text-sm text-muted">Ninguna postulación coincide con los filtros.</p>
      ) : (
        <div className="card relative overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs text-muted uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Puesto</th>
                <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">Ubicación</th>
                <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">Postulado</th>
                <th scope="col" className="hidden px-4 py-3 font-medium lg:table-cell">Recordatorio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id} className="relative hover:bg-surface-muted/60">
                  <td className="px-4 py-3">
                    <Link href={`/applications/${item.id}`} className="font-medium after:absolute after:inset-0 hover:text-primary">
                      {item.position}
                    </Link>
                    <div className="text-muted">{item.company}</div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  <td className="hidden px-4 py-3 text-muted md:table-cell">{item.location ?? "—"}</td>
                  <td className="hidden px-4 py-3 whitespace-nowrap text-muted sm:table-cell">{formatDate(item.appliedOn)}</td>
                  <td className="hidden px-4 py-3 whitespace-nowrap lg:table-cell">
                    {item.nextReminder ? (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5",
                          item.nextReminder <= today ? "font-medium text-amber-700 dark:text-amber-300" : "text-muted",
                        )}
                      >
                        <BellIcon width={13} height={13} /> {formatDate(item.nextReminder)}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card flex flex-col items-center px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
        <ColumnsIcon width={22} height={22} />
      </span>
      <h2 className="mt-4 text-lg font-semibold">Aún no tienes postulaciones</h2>
      <p className="mt-1 max-w-sm text-sm text-muted">
        Añade la primera oferta a la que te has postulado (o que quieres guardar) y empieza a
        seguir su progreso.
      </p>
      <Link href="/applications/new" className="btn btn-primary mt-6">
        <PlusIcon /> Añadir postulación
      </Link>
    </div>
  );
}
