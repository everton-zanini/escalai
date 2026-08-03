import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDatePtBR, getPeriodRange } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/schedule/empty-state";
import { DepartmentColorDot } from "@/components/schedule/department-color-dot";
import { MonthOverviewCalendar } from "@/components/schedule/month-overview-calendar";

export default async function InicioPage() {
  const user = await requireUser();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthRange = getPeriodRange("mes")!;

  const [assignments, monthAssignments] = await Promise.all([
    prisma.scheduleAssignment.findMany({
      where: {
        userId: Number(user.id),
        scheduleEntry: { date: { gte: today } },
      },
      include: {
        position: true,
        scheduleEntry: { include: { department: true } },
      },
      orderBy: { scheduleEntry: { date: "asc" } },
      take: 20,
    }),
    prisma.scheduleAssignment.findMany({
      where: {
        userId: Number(user.id),
        scheduleEntry: { date: { gte: monthRange.from, lte: monthRange.to } },
      },
      include: { scheduleEntry: { include: { department: true } } },
    }),
  ]);

  const calendarDays = monthAssignments.map(({ scheduleEntry }) => ({
    date: scheduleEntry.date.toISOString().slice(0, 10),
    color: scheduleEntry.department.color,
    departmentName: scheduleEntry.department.name,
  }));

  return (
    <div className="mx-auto w-full max-w-sm space-y-3 p-4">
      <MonthOverviewCalendar days={calendarDays} />

      <h1 className="text-lg font-semibold">Minhas próximas escalas</h1>

      {assignments.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nenhuma escala futura"
          description="Quando você for escalado em um departamento, aparecerá aqui."
        />
      ) : (
        assignments.map(({ id, scheduleEntry, position }) => (
          <Link
            key={id}
            href={`/departamentos/${scheduleEntry.departmentId}`}
            className="block"
          >
            <Card>
              <CardHeader className="space-y-1">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="w-fit gap-1.5">
                    <DepartmentColorDot color={scheduleEntry.department.color} />
                    {scheduleEntry.department.name}
                  </Badge>
                  {position && (
                    <Badge variant="outline" className="w-fit">
                      {position.name}
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium capitalize">
                  {formatDatePtBR(scheduleEntry.date)}
                </p>
              </CardHeader>
              {scheduleEntry.title && (
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  {scheduleEntry.title}
                </CardContent>
              )}
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}
