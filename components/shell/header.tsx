import { SignOutButton } from "@/components/shell/sign-out-button";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { InstallButton } from "@/components/shell/install-button";
import { DesktopNav } from "@/components/shell/desktop-nav";

interface HeaderProps {
  title: string;
  isAdmin: boolean;
  isLeader: boolean;
}

export function Header({ title, isAdmin, isLeader }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-6">
        <span className="text-lg font-semibold">{title}</span>
        <DesktopNav isAdmin={isAdmin} isLeader={isLeader} />
      </div>
      <div className="flex items-center gap-1">
        <InstallButton />
        <ThemeToggle />
        <SignOutButton />
      </div>
    </header>
  );
}
