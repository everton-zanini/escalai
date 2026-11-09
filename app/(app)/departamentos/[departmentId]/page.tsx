import Link from "next/link";
import { notFound } from "next/navigation";
import { requireDepartmentMember } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ScheduleEntryCard } from "@/components/schedule/schedule-entry-card";
import { EmptyState } from "@/components/schedule/empty-state";
import { LinkPendingOverlay } from "@/components/loading-overlay";
import { DepartmentMonthCalendar } from "@/components/schedule/department-month-calendar";
import { formatDateParam, formatDatePtBR } from "@/lib/utils";
import { CalendarDays, ListTree, Plus } from "lucide-react";

export default async function DepartamentoEscalaPage({
  params,
  searchParams,
}: {
  params: Promise<{ departmentId: string }>;
  searchParams: Promise<{ mes?: string; data?: string }>;
}) {
  const { departmentId: departmentIdParam } = await params;
  const departmentId = Number(departmentIdParam);
  const { mes, data } = await searchParams;

  const user = await requireDepartmentMember(departmentId);

  const selectedMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data ?? "");
  const selectedDate = selectedMatch
    ? new Date(Date.UTC(Number(selectedMatch[1]), Number(selectedMatch[2]) - 1, Number(selectedMatch[3])))
    : null;

  const monthMatch = /^(\d{4})-(\d{2})$/.exec(mes ?? "");
  const now = new Date();
  const year = monthMatch ? Number(monthMatch[1]) : (selectedDate?.getUTCFullYear() ?? now.getFullYear());
  const monthIndex = monthMatch ? Number(monthMatch[2]) - 1 : (selectedDate?.getUTCMonth() ?? now.getMonth());
  const monthParam = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

  // The grid also shows days of the neighbouring months.
  const gridFrom = new Date(Date.UTC(year, monthIndex, 1 - 7));
  const gridTo = new Date(Date.UTC(year, monthIndex + 1, 7));

  // Light queries only: the month's dates for the dots, and the full entries
  // (with people and positions) just for the day the user opened.
  const [department, monthEntries, dayEntries] = await Promise.all([
    prisma.department.findUnique({ where: { id: departmentId } }),
    prisma.scheduleEntry.findMany({
      where: { departmentId, date: { gte: gridFrom, lte: gridTo } },
      select: { date: true },
      distinct: ["date"],
    }),
    selectedDate
      ? prisma.scheduleEntry.findMany({
          where: { departmentId, date: selectedDate },
          include: { assignments: { include: { user: true, position: true } } },
          orderBy: [{ time: { sort: "asc", nulls: "last" } }],
        })
      : Promise.resolve(null),
  ]);
  if (!department) notFound();

  const markedDates = monthEntries.map((entry) => formatDateParam(entry.date));

  const roleClaim = user.departmentRoles.find((d) => d.departmentId === departmentId);
  const canManage = user.isAdmin || roleClaim?.role === "LIDER";

  return (
    <div className="mx-auto w-full max-w-sm space-y-4 p-4 md:max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">{department.name}</h1>
        {canManage && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href={`/departamentos/${departmentId}/funcoes`} />}
            >
              <ListTree className="size-4" />
              Funções
            </Button>
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href={`/departamentos/${departmentId}/nova`} />}
            >
              <Plus className="size-4" />
              Nova escala
            </Button>
          </div>
        )}
      </div>

      <DepartmentMonthCalendar
        basePath={`/departamentos/${departmentId}`}
        month={monthParam}
        markedDates={markedDates}
        selected={selectedDate ? formatDateParam(selectedDate) : null}
        color={department.color}
      />

      {selectedDate && dayEntries && (
        <section className="space-y-3" aria-live="polite">
          <h2 className="text-base font-semibold capitalize">{formatDatePtBR(selectedDate)}</h2>
          {dayEntries.length === 0 ? (
            <EmptyState icon={CalendarDays} title="Nenhuma escala neste dia" />
          ) : (
            dayEntries.map((entry) => (
              <ScheduleEntryCard
                key={entry.id}
                entry={entry}
                departmentId={departmentId}
                canManage={canManage}
                color={department.color}
              />
            ))
          )}
        </section>
      )}

      {!selectedDate && (
        <p className="text-center text-sm text-muted-foreground">
          Toque em um dia do calendário para ver a escala.
        </p>
      )}
    </div>
  );
}
