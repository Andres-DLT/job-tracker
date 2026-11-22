"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Resumen" },
  { href: "/applications", label: "Postulaciones" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1">
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active ? "bg-surface-muted text-foreground" : "text-muted hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
