import { notFound } from "next/navigation";
import { requireDepartmentLeader } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PositionForm } from "./position-form";
import { createPositionAction, deletePositionAction } from "./actions";

export default async function FuncoesPage({
  params,
}: {
  params: Promise<{ departmentId: string }>;
}) {
  const { departmentId: departmentIdParam } = await params;
  const departmentId = Number(departmentIdParam);

  await requireDepartmentLeader(departmentId);

  const department = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!department) notFound();

  const positions = await prisma.position.findMany({
    where: { departmentId },
    orderBy: { name: "asc" },
  });

  const boundCreate = createPositionAction.bind(null, departmentId);

  return (
    <div className="mx-auto w-full max-w-sm space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Funções · {department.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PositionForm action={boundCreate} />

          {positions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma função cadastrada ainda.
            </p>
          ) : (
            <div className="space-y-2">
              {positions.map((position) => (
                <div
                  key={position.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <span className="text-sm font-medium">{position.name}</span>
                  <form action={deletePositionAction}>
                    <input type="hidden" name="departmentId" value={departmentId} />
                    <input type="hidden" name="positionId" value={position.id} />
                    <Button type="submit" variant="destructive" size="sm">
                      Remover
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
