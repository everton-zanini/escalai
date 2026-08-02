import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DepartmentForm } from "../department-form";
import { AddMemberForm } from "./add-member-form";
import {
  updateDepartmentAction,
  toggleDepartmentActiveAction,
  removeMembershipAction,
  toggleMembershipRoleAction,
} from "../actions";

export default async function DepartamentoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const departmentId = Number(id);

  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    include: {
      memberships: { include: { user: true }, orderBy: { user: { name: "asc" } } },
    },
  });

  if (!department) notFound();

  const memberUserIds = department.memberships.map((m) => m.userId);
  const availableUsers = await prisma.user.findMany({
    where: { isActive: true, id: { notIn: memberUserIds } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });

  const updateAction = updateDepartmentAction.bind(null, departmentId);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{department.name}</CardTitle>
          <div className="flex items-center gap-2">
            {!department.isActive && <Badge variant="secondary">Inativo</Badge>}
            <form action={toggleDepartmentActiveAction}>
              <input type="hidden" name="departmentId" value={departmentId} />
              <Button type="submit" variant="outline" size="sm">
                {department.isActive ? "Desativar" : "Ativar"}
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <DepartmentForm
            action={updateAction}
            defaultValues={{ name: department.name, description: department.description }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Membros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AddMemberForm departmentId={departmentId} availableUsers={availableUsers} />

          <Separator />

          <div className="space-y-2">
            {department.memberships.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum membro ainda.</p>
            ) : (
              department.memberships.map((membership) => (
                <div
                  key={membership.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{membership.user.name}</p>
                    <p className="text-sm text-muted-foreground">{membership.user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={membership.role === "LIDER" ? "default" : "secondary"}>
                      {membership.role === "LIDER" ? "Líder" : "Membro"}
                    </Badge>
                    <form action={toggleMembershipRoleAction}>
                      <input type="hidden" name="membershipId" value={membership.id} />
                      <input type="hidden" name="departmentId" value={departmentId} />
                      <input
                        type="hidden"
                        name="nextRole"
                        value={membership.role === "LIDER" ? "MEMBRO" : "LIDER"}
                      />
                      <Button type="submit" variant="outline" size="sm">
                        {membership.role === "LIDER" ? "Tornar membro" : "Tornar líder"}
                      </Button>
                    </form>
                    <form action={removeMembershipAction}>
                      <input type="hidden" name="membershipId" value={membership.id} />
                      <input type="hidden" name="departmentId" value={departmentId} />
                      <Button type="submit" variant="destructive" size="sm">
                        Remover
                      </Button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
