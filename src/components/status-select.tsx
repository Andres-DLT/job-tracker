"use client";

import { useOptimistic, useTransition } from "react";
import { updateApplicationStatus } from "@/actions/applications";
import { APPLICATION_STATUSES, STATUS_META, type ApplicationStatus } from "@/lib/status";
import { cn } from "@/lib/utils";

export function StatusSelect({
  id,
  status,
  className,
}: {
  id: string;
  status: ApplicationStatus;
  className?: string;
}) {
  const [optimistic, setOptimistic] = useOptimistic(status);
  const [pending, startTransition] = useTransition();

  return (
    <label className={cn("relative inline-flex items-center", className)}>
      <span className="sr-only">Cambiar estado</span>
      <span
        className={cn("pointer-events-none absolute left-3 size-2 rounded-full", STATUS_META[optimistic].dot)}
      />
      <select
        value={optimistic}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as ApplicationStatus;
          startTransition(async () => {
            setOptimistic(next);
            const res = await updateApplicationStatus(id, next);
            if (!res.ok) alert(res.message ?? "No se pudo actualizar el estado");
          });
        }}
        className="input w-auto cursor-pointer py-1.5 pr-8 pl-7 font-medium"
      >
        {APPLICATION_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_META[s].label}
          </option>
        ))}
      </select>
    </label>
  );
}
