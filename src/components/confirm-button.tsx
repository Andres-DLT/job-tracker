"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";

/** Botón que pide confirmación y luego ejecuta una Server Action. */
export function ConfirmButton({
  action,
  confirmText,
  className,
  children,
  label,
}: {
  action: () => Promise<void>;
  confirmText: string;
  className?: string;
  children: React.ReactNode;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={pending}
      className={cn("btn", className)}
      onClick={() => {
        if (confirm(confirmText)) startTransition(() => action());
      }}
    >
      {children}
    </button>
  );
}
