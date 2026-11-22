import type { Metadata } from "next";
import Link from "next/link";
import { createApplication } from "@/actions/applications";
import { ApplicationForm } from "@/components/application-form";
import { ArrowLeftIcon } from "@/components/icons";
import { requireUser } from "@/lib/dal";
import { todayISO } from "@/lib/dates";

export const metadata: Metadata = { title: "Nueva postulación" };

export default async function NewApplicationPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/applications" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeftIcon /> Postulaciones
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Nueva postulación</h1>
      </div>
      <ApplicationForm
        action={createApplication}
        initial={{ status: "applied", appliedOn: todayISO() }}
        cancelHref="/applications"
        submitLabel="Guardar postulación"
      />
    </div>
  );
}
