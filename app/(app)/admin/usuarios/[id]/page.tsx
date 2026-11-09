import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { manageableUsersWhere } from "@/lib/tenant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormPendingOverlay } from "@/components/loading-overlay";
import { Separator } from "@/components/ui/separator";
import { UserForm } from "../user-form";
import { ResetPasswordForm } from "./reset-password-form";
import { updateUserAction, toggleUserActiveAction } from "../actions";

export default async function UsuarioDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = Number(id);

  const admin = await requireAdmin();
  const user = await prisma.user.findFirst({
    where: { id: userId, ...manageableUsersWhere(admin) },
    include: { memberships: { include: { department: true } } },
  });

  if (!user) notFound();

  const updateAction = updateUserAction.bind(null, userId);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{user.name}</CardTitle>
          <div className="flex items-center gap-2">
            {user.isAdmin && <Badge>Admin</Badge>}
            {!user.isActive && <Badge variant="secondary">Inativo</Badge>}
            <form action={toggleUserActiveAction}>
              <FormPendingOverlay message="Atualizando..." />
              <input type="hidden" name="userId" value={userId} />
              <Button type="submit" variant="outline" size="sm">
                {user.isActive ? "Desativar" : "Ativar"}
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <UserForm
            action={updateAction}
            defaultValues={{ name: user.name, email: user.email }}
          />
          <Separator />
          <ResetPasswordForm userId={userId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Departamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {user.memberships.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Não participa de nenhum departamento ainda.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user.memberships.map((m) => (
                <Badge key={m.id} variant="secondary">
                  {m.department.name} · {m.role === "LIDER" ? "Líder" : "Membro"}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
