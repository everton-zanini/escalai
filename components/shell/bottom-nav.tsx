"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, CalendarDays, CalendarOff, User, ShieldCheck, Users } from "lucide-react";

interface BottomNavProps {
  isAdmin: boolean;
  isLeader: boolean;
}

const baseItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/departamentos", label: "Escalas", icon: CalendarDays },
  { href: "/indisponibilidades", label: "Ausências", icon: CalendarOff },
  { href: "/perfil", label: "Perfil", icon: User },
];

const GRID_COLS = ["grid-cols-3", "grid-cols-4", "grid-cols-5", "grid-cols-6"];

export function BottomNav({ isAdmin, isLeader }: BottomNavProps) {
  const pathname = usePathname();
  const items = [
    ...baseItems,
    ...(isLeader ? [{ href: "/lider", label: "Líder", icon: Users }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }] : []),
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className={cn("grid", GRID_COLS[items.length - 3])}>
        {items.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-xs",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
