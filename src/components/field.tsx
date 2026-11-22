import { cn } from "@/lib/utils";

/** Etiqueta + control + mensajes de error/ayuda, con ids accesibles. */
export function Field({
  id,
  label,
  errors,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  errors?: string[];
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {errors?.length ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-danger">
          {errors[0]}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function FormMessage({ message, tone = "error" }: { message?: string; tone?: "error" | "success" }) {
  if (!message) return null;
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg px-3 py-2 text-sm",
        tone === "error"
          ? "bg-red-500/10 text-danger"
          : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      )}
    >
      {message}
    </p>
  );
}
