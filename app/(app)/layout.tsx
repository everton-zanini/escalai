import { redirect } from "next/navigation";
import { requireUser } from "@/lib/permissions";
import { Header } from "@/components/shell/header";
import { BottomNav } from "@/components/shell/bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  // The JWT's mustChangePassword claim is a snapshot from login time, so use the
  // DB value that requireUser already loaded (no second query).
  if (user.mustChangePassword) {
    redirect("/trocar-senha");
  }

  const isLeader = user.isAdmin || user.departmentRoles.some((d) => d.role === "LIDER");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header
        title="Escalaí"
        isAdmin={user.isAdmin}
        isSuperAdmin={user.isSuperAdmin}
        isLeader={isLeader}
      />
      <main className="flex-1 pb-20 md:pb-4">{children}</main>
      <BottomNav isAdmin={user.isAdmin} isSuperAdmin={user.isSuperAdmin} isLeader={isLeader} />
    </div>
  );
}
