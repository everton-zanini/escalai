import { notFound } from "next/navigation";
import { requireDepartmentLeader } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EntryForm } from "../entry-form";
import { createEntryAction } from "../actions";

export default async function NovaEscalaPage({
  params,
}: {
  params: Promise<{ departmentId: string }>;
}) {
  const { departmentId: departmentIdParam } = await params;
  const departmentId = Number(departmentIdParam);

  await requireDepartmentLeader(departmentId);

  const department = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!department) notFound();

  const [memberships, positions] = await Promise.all([
    prisma.departmentMembership.findMany({
      where: { departmentId },
      include: { user: true },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.position.findMany({ where: { departmentId }, orderBy: { name: "asc" } }),
  ]);

  const boundAction = createEntryAction.bind(null, departmentId);

  return (
    <div className="mx-auto w-full max-w-sm p-4">
      <Card>
        <CardHeader>
          <CardTitle>Nova escala · {department.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <EntryForm
            action={boundAction}
            members={memberships.map((m) => ({ id: m.userId, name: m.user.name }))}
            positions={positions}
          />
        </CardContent>
      </Card>
    </div>
  );
}
