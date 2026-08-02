import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/schedule/empty-state";
import { DepartmentColorDot } from "@/components/schedule/department-color-dot";
import { Building2, Plus } from "lucide-react";

export default async function AdminDepartamentosPage() {
  const departments = await prisma.department.findMany({
    include: { _count: { select: { memberships: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Departamentos</h1>
        <Button nativeButton={false} render={<Link href="/admin/departamentos/novo" />}>
          <Plus className="size-4" />
          Novo
        </Button>
      </div>

      {departments.length === 0 ? (
        <EmptyState icon={Building2} title="Nenhum departamento cadastrado" />
      ) : (
        <div className="space-y-2">
          {departments.map((department) => (
            <Link key={department.id} href={`/admin/departamentos/${department.id}`}>
              <Card>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="flex items-center gap-2 font-medium">
                      <DepartmentColorDot color={department.color} />
                      {department.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {department._count.memberships} pessoa(s)
                    </p>
                  </div>
                  {!department.isActive && <Badge variant="secondary">Inativo</Badge>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
