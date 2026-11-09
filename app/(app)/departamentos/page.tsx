import Link from "next/link";
import { requireChurchUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/schedule/empty-state";
import { DepartmentColorDot } from "@/components/schedule/department-color-dot";
import { Building2, ChevronRight } from "lucide-react";

export default async function DepartamentosPage() {
  const user = await requireChurchUser();

  const departments = user.isAdmin
    ? await prisma.department.findMany({
        where: { isActive: true, churchId: user.churchId },
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
    <div className="mx-auto w-full max-w-sm space-y-4 p-4 md:max-w-2xl">
      <h1 className="text-2xl font-semibold">Departamentos</h1>

      {departments.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Você ainda não faz parte de um departamento"
          description="Peça ao administrador para adicioná-lo a um departamento."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {departments.map((department) => {
            const role = roleByDepartment.get(department.id);
            return (
              <Link
                key={department.id}
                href={`/departamentos/${department.id}`}
                className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card
                  className="h-full border-l-4 transition-shadow hover:shadow-md"
                  style={{ borderLeftColor: department.color }}
                >
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <DepartmentColorDot color={department.color} />
                      {department.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {role && (
                        <Badge variant={role === "LIDER" ? "default" : "secondary"}>
                          {role === "LIDER" ? "Líder" : "Membro"}
                        </Badge>
                      )}
                      <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
                    </div>
                  </CardHeader>
                  {department.description && (
                    <CardContent className="line-clamp-2 pt-0 text-sm text-muted-foreground">
                      {department.description}
                    </CardContent>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
