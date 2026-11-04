"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, CalendarDays, CalendarOff, User, ShieldCheck, Users } from "lucide-react";

interface DesktopNavProps {
  isAdmin: boolean;
  isLeader: boolean;
}

const baseItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/departamentos", label: "Escalas", icon: CalendarDays },
  { href: "/indisponibilidades", label: "Ausências", icon: CalendarOff },
  { href: "/perfil", label: "Perfil", icon: User },
];

export function DesktopNav({ isAdmin, isLeader }: DesktopNavProps) {
  const pathname = usePathname();
  const items = [
    ...baseItems,
    ...(isLeader ? [{ href: "/lider", label: "Líder", icon: Users }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }] : []),
  ];

  return (
    <nav className="hidden md:flex md:items-center md:gap-1">
      {items.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
