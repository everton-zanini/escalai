import { SignOutButton } from "@/components/shell/sign-out-button";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4">
      <span className="text-lg font-semibold">{title}</span>
      <SignOutButton />
    </header>
  );
}
