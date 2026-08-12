import { CalendarOff } from "lucide-react";
import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/schedule/empty-state";
import { AvailabilityRequestForm } from "@/components/availability/availability-request-form";
import { createAvailabilityRequestAction } from "../actions";

export default async function NovaIndisponibilidadePage() {
  const user = await requireUser();

  const memberships = await prisma.departmentMembership.findMany({
    where: { userId: Number(user.id) },
    include: { department: true },
    orderBy: { department: { name: "asc" } },
  });

  return (
    <div className="mx-auto w-full max-w-sm p-4">
      <Card>
        <CardHeader>
          <CardTitle>Nova solicitação de ausência</CardTitle>
        </CardHeader>
        <CardContent>
          {memberships.length === 0 ? (
            <EmptyState
              icon={CalendarOff}
              title="Você ainda não faz parte de um departamento"
              description="Peça ao administrador para adicioná-lo a um departamento."
            />
          ) : (
            <AvailabilityRequestForm
              action={createAvailabilityRequestAction}
              departments={memberships.map((m) => ({
                id: m.department.id,
                name: m.department.name,
              }))}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
