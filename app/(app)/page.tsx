import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDatePtBR } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/schedule/empty-state";

export default async function InicioPage() {
  const user = await requireUser();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const assignments = await prisma.scheduleAssignment.findMany({
    where: {
      userId: Number(user.id),
      scheduleEntry: { date: { gte: today } },
    },
    include: {
      scheduleEntry: { include: { department: true } },
    },
    orderBy: { scheduleEntry: { date: "asc" } },
    take: 20,
  });

  return (
    <div className="mx-auto w-full max-w-sm space-y-3 p-4">
      <h1 className="text-lg font-semibold">Minhas próximas escalas</h1>

      {assignments.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nenhuma escala futura"
          description="Quando você for escalado em um departamento, aparecerá aqui."
        />
      ) : (
        assignments.map(({ scheduleEntry }) => (
          <Link
            key={scheduleEntry.id}
            href={`/departamentos/${scheduleEntry.departmentId}`}
            className="block"
          >
            <Card>
              <CardHeader className="space-y-1">
                <Badge variant="secondary" className="w-fit">
                  {scheduleEntry.department.name}
                </Badge>
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
