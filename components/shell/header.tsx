import { SignOutButton } from "@/components/shell/sign-out-button";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { InstallButton } from "@/components/shell/install-button";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4">
      <span className="text-lg font-semibold">{title}</span>
      <div className="flex items-center gap-1">
        <InstallButton />
        <ThemeToggle />
        <SignOutButton />
      </div>
    </header>
  );
}
