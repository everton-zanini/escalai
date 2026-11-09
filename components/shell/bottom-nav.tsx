"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, CalendarDays, CalendarOff, User, ShieldCheck, Users, Church } from "lucide-react";
import { LinkPendingOverlay } from "@/components/loading-overlay";

interface BottomNavProps {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLeader: boolean;
}

const baseItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/departamentos", label: "Escalas", icon: CalendarDays },
  { href: "/indisponibilidades", label: "Ausências", icon: CalendarOff },
  { href: "/perfil", label: "Perfil", icon: User },
];

export function BottomNav({ isAdmin, isSuperAdmin, isLeader }: BottomNavProps) {
  const pathname = usePathname();
  const items = [
    ...baseItems,
    ...(isLeader ? [{ href: "/lider", label: "Líder", icon: Users }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }] : []),
    ...(isSuperAdmin ? [{ href: "/super-admin", label: "Igrejas", icon: Church }] : []),
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul
        className="grid px-2 py-1"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-xs transition-colors",
                  isActive
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-5" />
                {label}
              <LinkPendingOverlay /></Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
