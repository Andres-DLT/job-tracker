"use client";

import { useActionState } from "react";
import { createReminder } from "@/actions/reminders";
import { addDaysISO } from "@/lib/dates";
import { Field, FormMessage } from "./field";
import { SubmitButton } from "./submit-button";

export function ReminderForm({ applicationId, today }: { applicationId: string; today: string }) {
  const [state, action] = useActionState(createReminder.bind(null, applicationId), undefined);
  const errors = state?.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-3" noValidate>
      <FormMessage message={state?.message} tone={state?.ok ? "success" : "error"} />
      <Field id="dueOn" label="Fecha" errors={errors.dueOn}>
        <input
          id="dueOn"
          name="dueOn"
          type="date"
          min={today}
          required
          defaultValue={state?.values?.dueOn ?? addDaysISO(today, 7)}
          aria-invalid={!!errors.dueOn}
          aria-describedby={errors.dueOn ? "dueOn-error" : undefined}
          className="input"
        />
      </Field>
      <Field id="message" label="¿Qué quieres recordar?" errors={errors.message}>
        <textarea
          id="message"
          name="message"
          rows={2}
          required
          defaultValue={state?.values?.message ?? ""}
          placeholder="Hacer seguimiento si no han respondido"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          className="input"
        />
      </Field>
      <SubmitButton className="w-full" pendingText="Guardando…">
        Programar recordatorio
      </SubmitButton>
    </form>
  );
}
