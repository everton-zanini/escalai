import Link from "next/link";
import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/schedule/empty-state";
import { Building2 } from "lucide-react";

export default async function DepartamentosPage() {
  const user = await requireUser();

  const departments = user.isAdmin
    ? await prisma.department.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      })
    : await prisma.department.findMany({
        where: {
          isActive: true,
          memberships: { some: { userId: Number(user.id) } },
        },
        orderBy: { name: "asc" },
      });

  const roleByDepartment = new Map(
    user.departmentRoles.map((d) => [d.departmentId, d.role])
  );

  return (
    <div className="mx-auto w-full max-w-sm space-y-3 p-4">
      <h1 className="text-lg font-semibold">Departamentos</h1>

      {departments.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Você ainda não faz parte de um departamento"
          description="Peça ao administrador para adicioná-lo a um departamento."
        />
      ) : (
        departments.map((department) => {
          const role = roleByDepartment.get(department.id);
          return (
            <Link key={department.id} href={`/departamentos/${department.id}`}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">{department.name}</CardTitle>
                  {role && (
                    <Badge variant={role === "LIDER" ? "default" : "secondary"}>
                      {role === "LIDER" ? "Líder" : "Membro"}
                    </Badge>
                  )}
                </CardHeader>
                {department.description && (
                  <CardContent className="pt-0 text-sm text-muted-foreground">
                    {department.description}
                  </CardContent>
                )}
              </Card>
            </Link>
          );
        })
      )}
    </div>
  );
}
