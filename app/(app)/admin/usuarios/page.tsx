import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { manageableUsersWhere } from "@/lib/tenant";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/schedule/empty-state";
import { Users, Plus } from "lucide-react";
import { LinkPendingOverlay } from "@/components/loading-overlay";

export default async function AdminUsuariosPage() {
  const admin = await requireAdmin();
  const users = await prisma.user.findMany({
    where: manageableUsersWhere(admin),
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, isAdmin: true, isActive: true },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Membros</h1>
        <Button nativeButton={false} render={<Link href="/admin/usuarios/novo" />}>
          <Plus className="size-4" />
          Novo
        <LinkPendingOverlay /></Button>
      </div>

      {users.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum membro cadastrado" />
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/admin/usuarios/${user.id}`}
              className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between py-1">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {user.isAdmin && <Badge>Admin</Badge>}
                    {!user.isActive && <Badge variant="secondary">Inativo</Badge>}
                  </div>
                </CardContent>
              </Card>
            <LinkPendingOverlay /></Link>
          ))}
        </div>
      )}
    </div>
  );
}
