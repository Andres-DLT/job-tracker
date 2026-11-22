"use client";

import Link from "next/link";
import { useActionState } from "react";
import { APPLICATION_STATUSES, STATUS_META } from "@/lib/status";
import type { APPLICATION_FIELDS, FormState } from "@/lib/validation";

type FieldKey = (typeof APPLICATION_FIELDS)[number];
import { Field, FormMessage } from "./field";
import { SubmitButton } from "./submit-button";

type Props = {
  action: (prev: FormState | undefined, formData: FormData) => Promise<FormState>;
  /** Valores iniciales (edición). */
  initial?: Partial<Record<FieldKey, string | null>>;
  cancelHref: string;
  submitLabel: string;
};

export function ApplicationForm({ action, initial, cancelHref, submitLabel }: Props) {
  const [state, formAction] = useActionState(action, undefined);
  const errors = state?.fieldErrors ?? {};

  // Tras un error se conservan los valores enviados; si no, los de la postulación.
  const value = (key: FieldKey) => state?.values?.[key] ?? initial?.[key] ?? "";

  const input = (id: FieldKey) => ({
    id,
    name: id,
    defaultValue: value(id),
    "aria-invalid": !!errors[id],
    "aria-describedby": errors[id] ? `${id}-error` : undefined,
    className: "input",
  });

  return (
    <form action={formAction} className="card space-y-6 p-5 sm:p-6" noValidate>
      <FormMessage message={state?.message} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="company" label="Empresa *" errors={errors.company}>
          <input {...input("company")} required autoFocus={!initial?.company} placeholder="Acme Inc." />
        </Field>
        <Field id="position" label="Puesto *" errors={errors.position}>
          <input {...input("position")} required placeholder="Frontend Developer" />
        </Field>
        <Field id="status" label="Estado" errors={errors.status}>
          <select {...input("status")} defaultValue={value("status") || "applied"}>
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
        </Field>
        <Field id="appliedOn" label="Fecha de postulación" errors={errors.appliedOn}>
          <input {...input("appliedOn")} type="date" />
        </Field>
        <Field id="location" label="Ubicación" errors={errors.location}>
          <input {...input("location")} placeholder="Remoto · Madrid · CDMX" />
        </Field>
        <Field id="salary" label="Salario" errors={errors.salary}>
          <input {...input("salary")} placeholder="45.000 € / año" />
        </Field>
        <Field id="jobUrl" label="Enlace a la oferta" errors={errors.jobUrl}>
          <input {...input("jobUrl")} type="url" inputMode="url" placeholder="https://…" />
        </Field>
        <Field id="contact" label="Contacto" errors={errors.contact}>
          <input {...input("contact")} placeholder="Nombre del reclutador, email…" />
        </Field>
      </div>

      <Field id="notes" label="Notas" errors={errors.notes}>
        <textarea {...input("notes")} rows={5} placeholder="Preguntas de la entrevista, impresiones, próximos pasos…" />
      </Field>

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <Link href={cancelHref} className="btn btn-secondary">
          Cancelar
        </Link>
        <SubmitButton pendingText="Guardando…">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
