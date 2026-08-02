import Link from "next/link";
import { notFound } from "next/navigation";
import { requireDepartmentMember } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ScheduleEntryCard } from "@/components/schedule/schedule-entry-card";
import { EmptyState } from "@/components/schedule/empty-state";
import { CalendarDays, Plus } from "lucide-react";

export default async function DepartamentoEscalaPage({
  params,
}: {
  params: Promise<{ departmentId: string }>;
}) {
  const { departmentId: departmentIdParam } = await params;
  const departmentId = Number(departmentIdParam);

  const user = await requireDepartmentMember(departmentId);

  const department = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!department) notFound();

  const entries = await prisma.scheduleEntry.findMany({
    where: { departmentId },
    include: { assignments: { include: { user: true } } },
    orderBy: { date: "asc" },
  });

  const roleClaim = user.departmentRoles.find((d) => d.departmentId === departmentId);
  const canManage = user.isAdmin || roleClaim?.role === "LIDER";

  return (
    <div className="mx-auto w-full max-w-sm space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{department.name}</h1>
        {canManage && (
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={`/departamentos/${departmentId}/nova`} />}
          >
            <Plus className="size-4" />
            Nova escala
          </Button>
        )}
      </div>

      {entries.length === 0 ? (
        <EmptyState icon={CalendarDays} title="Nenhuma escala lançada ainda" />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <ScheduleEntryCard
              key={entry.id}
              entry={entry}
              departmentId={departmentId}
              canManage={canManage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
