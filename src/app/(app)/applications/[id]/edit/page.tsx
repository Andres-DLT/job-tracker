import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateApplication } from "@/actions/applications";
import { ApplicationForm } from "@/components/application-form";
import { ArrowLeftIcon } from "@/components/icons";
import { requireUser } from "@/lib/dal";
import { getApplication } from "@/lib/queries";

export const metadata: Metadata = { title: "Editar postulación" };

export default async function EditApplicationPage({ params }: PageProps<"/applications/[id]/edit">) {
  const user = await requireUser();
  const { id } = await params;
  const data = await getApplication(user.id, id);
  if (!data) notFound();
  const app = data.application;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href={`/applications/${app.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeftIcon /> Volver
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Editar postulación</h1>
      </div>
      <ApplicationForm
        action={updateApplication.bind(null, app.id)}
        initial={{
          company: app.company,
          position: app.position,
          status: app.status,
          location: app.location,
          jobUrl: app.jobUrl,
          salary: app.salary,
          contact: app.contact,
          appliedOn: app.appliedOn,
          notes: app.notes,
        }}
        cancelHref={`/applications/${app.id}`}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
