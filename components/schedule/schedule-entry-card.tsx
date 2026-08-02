import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AssigneeAvatars } from "@/components/schedule/assignee-avatars";
import { formatDatePtBR } from "@/lib/utils";
import { Pencil } from "lucide-react";

interface ScheduleEntryCardProps {
  entry: {
    id: number;
    date: Date | string;
    title: string | null;
    note: string | null;
    assignments: {
      user: { id: number; name: string };
      position: { id: number; name: string } | null;
    }[];
  };
  departmentId: number;
  canManage: boolean;
}

export function ScheduleEntryCard({ entry, departmentId, canManage }: ScheduleEntryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <p className="text-sm font-medium capitalize">{formatDatePtBR(entry.date)}</p>
          {entry.title && <p className="text-base font-semibold">{entry.title}</p>}
          {entry.note && <p className="text-sm text-muted-foreground">{entry.note}</p>}
        </div>
        {canManage && (
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            render={
              <Link href={`/departamentos/${departmentId}/${entry.id}/editar`} aria-label="Editar escala" />
            }
          >
            <Pencil className="size-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <AssigneeAvatars
          people={entry.assignments.map((a) => ({
            ...a.user,
            positionName: a.position?.name ?? null,
          }))}
        />
      </CardContent>
    </Card>
  );
}
