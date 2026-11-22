import Link from "next/link";
import { redirect } from "next/navigation";
import { BellIcon, ColumnsIcon, CheckIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/dal";
import { APPLICATION_STATUSES, STATUS_META } from "@/lib/status";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: ColumnsIcon,
    title: "Tablero por estados",
    text: "Arrastra cada postulación entre columnas: por postular, entrevistas, oferta…",
  },
  {
    icon: CheckIcon,
    title: "Historial de cada proceso",
    text: "Cada cambio de estado queda registrado con su fecha para que no pierdas el hilo.",
  },
  {
    icon: BellIcon,
    title: "Recordatorios por email",
    text: "Programa un seguimiento y te llegará un correo el día indicado.",
  },
];

export default async function HomePage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn btn-ghost">
            Iniciar sesión
          </Link>
          <Link href="/register" className="btn btn-primary">
            Crear cuenta
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-12 pb-20 sm:pt-20">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Tu búsqueda de empleo, en orden.
          </h1>
          <p className="mt-5 text-lg text-muted text-pretty">
            Registra cada postulación, sigue en qué punto está y recibe recordatorios para hacer
            seguimiento en el momento justo.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn btn-primary px-5 py-2.5">
              Empezar gratis
            </Link>
            <Link href="/login" className="btn btn-secondary px-5 py-2.5">
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap gap-2" aria-hidden="true">
          {APPLICATION_STATUSES.map((s) => (
            <span
              key={s}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset",
                STATUS_META[s].badge,
              )}
            >
              <span className={cn("size-1.5 rounded-full", STATUS_META[s].dot)} />
              {STATUS_META[s].label}
            </span>
          ))}
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="card p-5">
              <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon />
              </span>
              <h2 className="mt-4 font-semibold">{title}</h2>
              <p className="mt-1.5 text-sm text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
