import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <>
      <h1 className="text-xl font-semibold">Bienvenido de nuevo</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Entra para ver tus postulaciones.</p>
      <AuthForm mode="login" />
    </>
  );
}
