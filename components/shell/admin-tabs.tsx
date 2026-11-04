"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/departamentos", label: "Departamentos" },
  { href: "/admin/usuarios", label: "Membros" },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 rounded-xl bg-muted p-1 text-sm font-medium" aria-label="Administração">
      {tabs.map(({ href, label }) => {
        const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-center transition-colors",
              isActive
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
