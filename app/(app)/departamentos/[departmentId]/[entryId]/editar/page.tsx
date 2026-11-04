import { notFound } from "next/navigation";
import { requireDepartmentLeader } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormPendingOverlay } from "@/components/loading-overlay";
import { EntryForm } from "../../entry-form";
import { updateEntryAction, deleteEntryAction } from "../../actions";

export default async function EditarEscalaPage({
  params,
}: {
  params: Promise<{ departmentId: string; entryId: string }>;
}) {
  const { departmentId: departmentIdParam, entryId: entryIdParam } = await params;
  const departmentId = Number(departmentIdParam);
  const entryId = Number(entryIdParam);

  await requireDepartmentLeader(departmentId);

  const [department, entry, memberships, positions] = await Promise.all([
    prisma.department.findUnique({ where: { id: departmentId } }),
    prisma.scheduleEntry.findUnique({
      where: { id: entryId },
      include: { assignments: true },
    }),
    prisma.departmentMembership.findMany({
      where: { departmentId },
      include: { user: true },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.position.findMany({ where: { departmentId }, orderBy: { name: "asc" } }),
  ]);

  if (!department || !entry || entry.departmentId !== departmentId) notFound();

  const boundUpdate = updateEntryAction.bind(null, departmentId, entryId);

  return (
    <div className="mx-auto w-full max-w-sm space-y-4 p-4 md:max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Editar escala · {department.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <EntryForm
            departmentId={departmentId}
            action={boundUpdate}
            members={memberships.map((m) => ({ id: m.userId, name: m.user.name }))}
            positions={positions}
            defaultValues={{
              date: entry.date.toISOString().slice(0, 10),
              time: entry.time ?? "",
              title: entry.title ?? "",
              note: entry.note ?? "",
              assignments: entry.assignments.map((a) => ({
                userId: a.userId,
                positionId: a.positionId,
              })),
            }}
            submitLabel="Salvar alterações"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="mb-3 text-sm text-muted-foreground">
            Excluir esta escala remove o registro e todos os escalados desse dia.
          </p>
          <form action={deleteEntryAction}>
            <FormPendingOverlay message="Excluindo..." />
            <input type="hidden" name="departmentId" value={departmentId} />
            <input type="hidden" name="entryId" value={entryId} />
            <Button type="submit" variant="destructive" className="w-full">
              Excluir escala
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
