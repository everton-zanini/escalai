import { CalendarCheck } from "lucide-react";
import { SignOutButton } from "@/components/shell/sign-out-button";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { InstallButton } from "@/components/shell/install-button";
import { DesktopNav } from "@/components/shell/desktop-nav";

interface HeaderProps {
  title: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLeader: boolean;
}

export function Header({ title, isAdmin, isSuperAdmin, isLeader }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur">
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-2 text-lg font-semibold">
          <CalendarCheck className="size-5 text-primary" aria-hidden />
          {title}
        </span>
        <DesktopNav isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} isLeader={isLeader} />
      </div>
      <div className="flex items-center gap-1">
        <InstallButton />
        <ThemeToggle />
        <SignOutButton />
      </div>
    </header>
  );
}
