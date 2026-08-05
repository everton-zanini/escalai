import { requireAnyDepartmentLeader } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { parseDateParam } from "@/lib/utils";
import { ScheduleEntryCard } from "@/components/schedule/schedule-entry-card";
import { EmptyState } from "@/components/schedule/empty-state";
import { DateDayNav } from "@/components/schedule/date-day-nav";
import { DepartmentColorDot } from "@/components/schedule/department-color-dot";
import { CalendarDays } from "lucide-react";
import type { Prisma } from "@prisma/client";

export default async function LiderPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const user = await requireAnyDepartmentLeader();
  const { data } = await searchParams;
  const selectedDate = parseDateParam(data);

  const ledDepartmentIds = user.departmentRoles
    .filter((d) => d.role === "LIDER")
    .map((d) => d.departmentId);

  const where: Prisma.ScheduleEntryWhereInput = user.isAdmin
    ? { date: selectedDate }
    : { date: selectedDate, departmentId: { in: ledDepartmentIds } };

  const entries = await prisma.scheduleEntry.findMany({
    where,
    include: { department: true, assignments: { include: { user: true, position: true } } },
    orderBy: [{ time: { sort: "asc", nulls: "last" } }, { department: { name: "asc" } }],
  });

  return (
    <div className="mx-auto w-full max-w-sm space-y-3 p-4">
      <h1 className="text-lg font-semibold">Escala do dia</h1>

      <DateDayNav date={selectedDate} basePath="/lider" />

      {entries.length === 0 ? (
        <EmptyState icon={CalendarDays} title="Nenhuma escala neste dia" />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const canManage =
              user.isAdmin ||
              user.departmentRoles.find((d) => d.departmentId === entry.departmentId)?.role === "LIDER";

            return (
              <div key={entry.id} className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <DepartmentColorDot color={entry.department.color} />
                  {entry.department.name}
                </div>
                <ScheduleEntryCard
                  entry={entry}
                  departmentId={entry.departmentId}
                  canManage={canManage}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
