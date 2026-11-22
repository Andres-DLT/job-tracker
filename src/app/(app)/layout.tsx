import { logout } from "@/actions/auth";
import { LogOutIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { NavLinks } from "@/components/nav-links";
import { requireUser } from "@/lib/dal";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-surface/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
          <Logo href="/dashboard" />
          <div className="hidden sm:block">
            <NavLinks />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-sm text-muted md:inline" title={user.email}>
              {user.name}
            </span>
            <form action={logout}>
              <button type="submit" className="btn btn-ghost px-2.5" title="Cerrar sesión">
                <LogOutIcon />
                <span className="sr-only sm:not-sr-only">Salir</span>
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-border px-2 py-1.5 sm:hidden">
          <NavLinks />
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
