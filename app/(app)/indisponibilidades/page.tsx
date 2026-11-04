import Link from "next/link";
import { CalendarOff, Plus } from "lucide-react";
import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDatePtBR } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormPendingOverlay } from "@/components/loading-overlay";
import { EmptyState } from "@/components/schedule/empty-state";
import { DepartmentColorDot } from "@/components/schedule/department-color-dot";
import { deleteAvailabilityRequestAction } from "./actions";

const STATUS_LABEL = {
  PENDENTE: "Pendente",
  APROVADA: "Aprovada",
  RECUSADA: "Recusada",
} as const;

const STATUS_VARIANT = {
  PENDENTE: "outline",
  APROVADA: "default",
  RECUSADA: "destructive",
} as const;

export default async function IndisponibilidadesPage() {
  const user = await requireUser();

  const requests = await prisma.availabilityRequest.findMany({
    where: { userId: Number(user.id) },
    include: { department: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-sm space-y-4 p-4 md:max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Ausências</h1>
        <Button size="sm" nativeButton={false} render={<Link href="/indisponibilidades/nova" />}>
          <Plus className="size-4" />
          Nova solicitação
        </Button>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={CalendarOff}
          title="Nenhuma solicitação de ausência"
          description="Informe os dias em que não poderá servir e o líder do departamento poderá aprovar."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {requests.map((request) => (
            <Card
              key={request.id}
              className="border-l-4"
              style={{ borderLeftColor: request.department.color }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base capitalize">
                  <DepartmentColorDot color={request.department.color} />
                  {formatDatePtBR(request.date)}
                </CardTitle>
                <Badge variant={STATUS_VARIANT[request.status]}>
                  {STATUS_LABEL[request.status]}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2 pt-0 text-sm">
                <p className="text-muted-foreground">{request.department.name}</p>
                <p>{request.reason}</p>
                {request.status === "PENDENTE" && (
                  <form action={deleteAvailabilityRequestAction}>
                    <FormPendingOverlay message="Cancelando..." />
                    <input type="hidden" name="requestId" value={request.id} />
                    <Button type="submit" variant="destructive" size="sm">
                      Cancelar solicitação
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
