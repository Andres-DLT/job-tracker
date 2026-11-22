import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">No encontramos esta página</h1>
      <p className="mt-2 text-sm text-muted">Puede que la postulación se haya eliminado o que el enlace no sea correcto.</p>
      <Link href="/dashboard" className="btn btn-primary mt-6">
        Ir al resumen
      </Link>
    </main>
  );
}
