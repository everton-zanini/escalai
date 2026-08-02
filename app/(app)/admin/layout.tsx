import Link from "next/link";
import { requireAdmin } from "@/lib/permissions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 p-4">
      <nav className="flex gap-4 border-b pb-2 text-sm font-medium">
        <Link href="/admin">Painel</Link>
        <Link href="/admin/departamentos">Departamentos</Link>
        <Link href="/admin/usuarios">Usuários</Link>
      </nav>
      {children}
    </div>
  );
}
