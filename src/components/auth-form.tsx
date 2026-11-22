"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, register } from "@/actions/auth";
import { Field, FormMessage } from "./field";
import { SubmitButton } from "./submit-button";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [state, action] = useActionState(mode === "login" ? login : register, undefined);
  const errors = state?.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage message={state?.message} />
      {mode === "register" && (
        <Field id="name" label="Nombre" errors={errors.name}>
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            defaultValue={state?.values?.name}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            className="input"
          />
        </Field>
      )}
      <Field id="email" label="Email" errors={errors.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state?.values?.email}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          className="input"
        />
      </Field>
      <Field
        id="password"
        label="Contraseña"
        errors={errors.password}
        hint={mode === "register" ? "Mínimo 8 caracteres" : undefined}
      >
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={mode === "register" ? 8 : undefined}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
          className="input"
        />
      </Field>
      <SubmitButton className="w-full" pendingText={mode === "login" ? "Entrando…" : "Creando cuenta…"}>
        {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
      </SubmitButton>
      <p className="text-center text-sm text-muted">
        {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
        <Link
          href={mode === "login" ? "/register" : "/login"}
          className="font-medium text-primary hover:underline"
        >
          {mode === "login" ? "Regístrate" : "Inicia sesión"}
        </Link>
      </p>
    </form>
  );
}
