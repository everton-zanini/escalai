import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CHURCH_STATUS_LABEL } from "@/lib/church";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChurchForm } from "../../church-form";
import { updateChurchAction } from "../../actions";
import { AddAdminForm } from "./add-admin-form";
import { ResetAdminPasswordForm } from "./reset-admin-password-form";

export default async function IgrejaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const churchId = Number(id);
  if (!Number.isInteger(churchId)) notFound();

  const church = await prisma.church.findUnique({
    where: { id: churchId },
    include: {
      users: {
        where: { isAdmin: true, isSuperAdmin: false },
        orderBy: { name: "asc" },
        select: { id: true, name: true, email: true, isActive: true },
      },
      _count: { select: { users: true, departments: true } },
    },
  });

  if (!church) notFound();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{church.name}</CardTitle>
          <Badge variant={church.status === "SUSPENSA" ? "destructive" : "secondary"}>
            {CHURCH_STATUS_LABEL[church.status]}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {church._count.users} membros · {church._count.departments} departamentos
          </p>
          <ChurchForm
            action={updateChurchAction.bind(null, churchId)}
            defaultValues={{
              name: church.name,
              plan: church.plan,
              status: church.status,
              expiresAt: church.expiresAt?.toISOString().slice(0, 10) ?? "",
              notes: church.notes ?? "",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Administradores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {church.users.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum administrador.</p>
          ) : (
            <ul className="space-y-3">
              {church.users.map((admin) => (
                <li key={admin.id} className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{admin.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{admin.email}</p>
                    </div>
                    {!admin.isActive && <Badge variant="secondary">Inativo</Badge>}
                  </div>
                  <ResetAdminPasswordForm userId={admin.id} />
                </li>
              ))}
            </ul>
          )}
          <AddAdminForm churchId={churchId} />
        </CardContent>
      </Card>
    </div>
  );
}
