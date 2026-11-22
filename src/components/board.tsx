"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { updateApplicationStatus } from "@/actions/applications";
import { formatDate } from "@/lib/dates";
import type { ApplicationListItem } from "@/lib/queries";
import { APPLICATION_STATUSES, STATUS_META, type ApplicationStatus } from "@/lib/status";
import { cn } from "@/lib/utils";
import { BellIcon, MapPinIcon } from "./icons";

const DRAG_TYPE = "application/x-job-application";

export function Board({ items, today }: { items: ApplicationListItem[]; today: string }) {
  const [optimisticItems, moveOptimistic] = useOptimistic(
    items,
    (state, { id, status }: { id: string; status: ApplicationStatus }) =>
      state.map((item) => (item.id === id ? { ...item, status } : item)),
  );
  const [, startTransition] = useTransition();
  const [dropTarget, setDropTarget] = useState<ApplicationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  function move(id: string, status: ApplicationStatus) {
    const item = optimisticItems.find((i) => i.id === id);
    if (!item || item.status === status) return;
    setError(null);
    startTransition(async () => {
      moveOptimistic({ id, status });
      const res = await updateApplicationStatus(id, status);
      if (!res.ok) setError(res.message ?? "No se pudo mover la postulación");
    });
  }

  return (
    <div>
      {error && <p role="alert" className="mb-3 text-sm text-danger">{error}</p>}
      <div className="relative -mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <div className="grid auto-cols-[minmax(196px,1fr)] grid-flow-col gap-3">
          {APPLICATION_STATUSES.map((status) => {
            const columnItems = optimisticItems.filter((i) => i.status === status);
            return (
              <section
                key={status}
                aria-label={STATUS_META[status].label}
                onDragOver={(e) => {
                  if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setDropTarget(status);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDropTarget(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDropTarget(null);
                  const id = e.dataTransfer.getData(DRAG_TYPE);
                  if (id) move(id, status);
                }}
                className={cn(
                  "flex min-h-64 flex-col rounded-xl border bg-surface-muted/60 p-2 transition-colors",
                  dropTarget === status ? "border-primary bg-primary/5" : "border-transparent",
                )}
              >
                <header className="flex items-center justify-between px-2 py-1.5">
                  <h2 className="flex items-center gap-2 text-sm font-semibold">
                    <span className={cn("size-2 rounded-full", STATUS_META[status].dot)} />
                    {STATUS_META[status].label}
                  </h2>
                  <span className="text-xs tabular-nums text-muted">{columnItems.length}</span>
                </header>
                <ul className="flex flex-1 flex-col gap-2">
                  {columnItems.map((item) => (
                    <BoardCard key={item.id} item={item} today={today} onMove={move} />
                  ))}
                  {columnItems.length === 0 && (
                    <li className="grid flex-1 place-items-center rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted">
                      Arrastra aquí
                    </li>
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BoardCard({
  item,
  today,
  onMove,
}: {
  item: ApplicationListItem;
  today: string;
  onMove: (id: string, status: ApplicationStatus) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const overdue = item.nextReminder !== null && item.nextReminder <= today;

  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(DRAG_TYPE, item.id);
        e.dataTransfer.effectAllowed = "move";
        setDragging(true);
      }}
      onDragEnd={() => setDragging(false)}
      className={cn(
        "group cursor-grab rounded-lg border border-border bg-surface p-3 shadow-xs transition active:cursor-grabbing",
        dragging && "opacity-50",
      )}
    >
      <Link
        href={`/applications/${item.id}`}
        draggable={false}
        className="block font-medium leading-snug hover:text-primary"
      >
        {item.position}
      </Link>
      <p className="mt-0.5 text-sm text-muted">{item.company}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        {item.location && (
          <span className="inline-flex items-center gap-1">
            <MapPinIcon width={12} height={12} />
            {item.location}
          </span>
        )}
        {item.appliedOn && <span>{formatDate(item.appliedOn)}</span>}
        {item.nextReminder && (
          <span
            className={cn(
              "inline-flex items-center gap-1",
              overdue && "font-medium text-amber-700 dark:text-amber-300",
            )}
            title="Próximo recordatorio"
          >
            <BellIcon width={12} height={12} />
            {formatDate(item.nextReminder)}
          </span>
        )}
      </div>
      {/* Alternativa accesible al arrastre (teclado y móvil) */}
      <label className="mt-2 block">
        <span className="sr-only">Mover {item.position} a</span>
        <select
          value={item.status}
          onChange={(e) => onMove(item.id, e.target.value as ApplicationStatus)}
          className="w-full cursor-pointer rounded-md border border-transparent bg-transparent py-0.5 text-xs text-muted hover:border-border focus:border-border focus:outline-none"
        >
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              Mover a: {STATUS_META[s].label}
            </option>
          ))}
        </select>
      </label>
    </li>
  );
}
