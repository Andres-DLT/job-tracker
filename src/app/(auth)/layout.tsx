import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/dal";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="card w-full max-w-sm p-6 shadow-sm">{children}</div>
    </main>
  );
}
