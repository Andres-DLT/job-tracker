import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-xl font-semibold">Crea tu cuenta</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Empieza a organizar tu búsqueda en un minuto.</p>
      <AuthForm mode="register" />
    </>
  );
}
