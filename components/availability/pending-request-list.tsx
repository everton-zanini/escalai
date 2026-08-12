import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DepartmentColorDot } from "@/components/schedule/department-color-dot";
import { formatDatePtBR } from "@/lib/utils";
import { reviewAvailabilityRequestAction } from "@/app/(app)/lider/actions";

interface PendingRequestListProps {
  requests: {
    id: number;
    date: Date | string;
    reason: string;
    user: { name: string };
    department: { name: string; color: string };
  }[];
}

export function PendingRequestList({ requests }: PendingRequestListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pedidos de ausência pendentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.map((request) => (
          <div key={request.id} className="space-y-1.5 rounded-lg border p-3 text-sm">
            <div className="flex items-center gap-1.5 font-medium">
              <DepartmentColorDot color={request.department.color} />
              {request.department.name}
            </div>
            <p className="capitalize text-muted-foreground">{formatDatePtBR(request.date)}</p>
            <p className="font-medium">{request.user.name}</p>
            <p className="text-muted-foreground">{request.reason}</p>
            <div className="flex gap-2 pt-1">
              <form
                action={reviewAvailabilityRequestAction.bind(null, request.id, "APROVADA")}
                className="flex-1"
              >
                <Button type="submit" size="sm" className="w-full">
                  Aceitar
                </Button>
              </form>
              <form
                action={reviewAvailabilityRequestAction.bind(null, request.id, "RECUSADA")}
                className="flex-1"
              >
                <Button type="submit" variant="destructive" size="sm" className="w-full">
                  Recusar
                </Button>
              </form>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
