import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDatePtBR, getPeriodRange } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/schedule/empty-state";
import { DepartmentColorDot } from "@/components/schedule/department-color-dot";
import { MonthOverviewCalendar } from "@/components/schedule/month-overview-calendar";

function dayLabel(date: Date, todayUtc: Date) {
  const diffDays = Math.round((date.getTime() - todayUtc.getTime()) / 86_400_000);
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Amanhã";
  return formatDatePtBR(date);
}

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

  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const firstName = user.name?.trim().split(/\s+/)[0];
  const next = assignments[0];

  const groups: { key: string; label: string; items: typeof assignments }[] = [];
  for (const assignment of assignments) {
    const key = assignment.scheduleEntry.date.toISOString().slice(0, 10);
    const last = groups[groups.length - 1];
    if (last?.key === key) {
      last.items.push(assignment);
    } else {
      groups.push({
        key,
        label: dayLabel(assignment.scheduleEntry.date, todayUtc),
        items: [assignment],
      });
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-6 p-4 md:max-w-2xl">
      <section className="space-y-1">
        <h1 className="text-2xl font-semibold">Olá{firstName ? `, ${firstName}` : ""}</h1>
        {next ? (
          <p className="text-sm text-muted-foreground">
            Próxima escala:{" "}
            <span className="font-medium text-foreground">
              {next.scheduleEntry.department.name} · {dayLabel(next.scheduleEntry.date, todayUtc)}
              {next.scheduleEntry.time ? ` às ${next.scheduleEntry.time}` : ""}
            </span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Você não tem escalas futuras.</p>
        )}
      </section>

      <Card>
        <CardContent>
          <MonthOverviewCalendar days={calendarDays} />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Minhas próximas escalas</h2>

      {assignments.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nenhuma escala futura"
          description="Quando você for escalado em um departamento, aparecerá aqui."
          action={
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/departamentos" />}
            >
              Ver departamentos
            </Button>
          }
        />
      ) : (
        groups.map((group) => (
          <div key={group.key} className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground capitalize">{group.label}</h3>
            <div className="grid gap-3 md:grid-cols-2">
        {group.items.map(({ id, scheduleEntry, position }) => (
          <Link
            key={id}
            href={`/departamentos/${scheduleEntry.departmentId}`}
            className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card
              className="border-l-4 transition-shadow hover:shadow-md"
              style={{ borderLeftColor: scheduleEntry.department.color }}
            >
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
                {scheduleEntry.time && (
                  <p className="pt-1 text-xl leading-none font-semibold tabular-nums">
                    {scheduleEntry.time}
                  </p>
                )}
              </CardHeader>
              {scheduleEntry.title && (
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  {scheduleEntry.title}
                </CardContent>
              )}
            </Card>
          </Link>
        ))}
            </div>
          </div>
        ))
      )}
      </section>
    </div>
  );
}
