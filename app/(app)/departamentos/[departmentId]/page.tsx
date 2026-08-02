import Link from "next/link";
import { notFound } from "next/navigation";
import { requireDepartmentMember } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ScheduleEntryCard } from "@/components/schedule/schedule-entry-card";
import { EmptyState } from "@/components/schedule/empty-state";
import { getPeriodRange, type SchedulePeriod } from "@/lib/utils";
import { CalendarDays, ListTree, Plus } from "lucide-react";

const PERIOD_OPTIONS: { value: SchedulePeriod; label: string }[] = [
  { value: "dia", label: "Dia" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" },
  { value: "todas", label: "Todas" },
];

function resolvePeriod(raw: string | undefined): SchedulePeriod {
  return PERIOD_OPTIONS.some((option) => option.value === raw)
    ? (raw as SchedulePeriod)
    : "mes";
}

export default async function DepartamentoEscalaPage({
  params,
  searchParams,
}: {
  params: Promise<{ departmentId: string }>;
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { departmentId: departmentIdParam } = await params;
  const departmentId = Number(departmentIdParam);
  const { periodo: periodoParam } = await searchParams;
  const period = resolvePeriod(periodoParam);

  const user = await requireDepartmentMember(departmentId);

  const department = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!department) notFound();

  const range = getPeriodRange(period);

  const entries = await prisma.scheduleEntry.findMany({
    where: {
      departmentId,
      ...(range ? { date: { gte: range.from, lte: range.to } } : {}),
    },
    include: { assignments: { include: { user: true, position: true } } },
    orderBy: { date: "asc" },
  });

  const roleClaim = user.departmentRoles.find((d) => d.departmentId === departmentId);
  const canManage = user.isAdmin || roleClaim?.role === "LIDER";

  return (
    <div className="mx-auto w-full max-w-sm space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{department.name}</h1>
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

      <div className="flex gap-2">
        {PERIOD_OPTIONS.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={option.value === period ? "default" : "outline"}
            nativeButton={false}
            render={<Link href={`/departamentos/${departmentId}?periodo=${option.value}`} />}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={period === "todas" ? "Nenhuma escala lançada ainda" : "Nenhuma escala neste período"}
        />
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
