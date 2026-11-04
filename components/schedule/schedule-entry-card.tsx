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
    time: string | null;
    title: string | null;
    note: string | null;
    assignments: {
      id: number;
      user: { id: number; name: string };
      position: { id: number; name: string } | null;
    }[];
  };
  departmentId: number;
  canManage: boolean;
  color?: string;
}

export function ScheduleEntryCard({ entry, departmentId, canManage, color }: ScheduleEntryCardProps) {
  return (
    <Card
      className={color ? "border-l-4" : undefined}
      style={color ? { borderLeftColor: color } : undefined}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div className="space-y-1">
          {entry.time && (
            <p className="text-xl leading-none font-semibold tabular-nums">{entry.time}</p>
          )}
          <p className="text-sm text-muted-foreground capitalize">
            {formatDatePtBR(entry.date)}
          </p>
          {entry.title && <p className="pt-1 text-base font-semibold">{entry.title}</p>}
          {entry.note && <p className="text-sm text-muted-foreground">{entry.note}</p>}
        </div>
        {canManage && (
          <Button
            variant="ghost"
            size="icon"
            className="size-11 shrink-0"
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
            key: a.id,
            name: a.user.name,
            positionName: a.position?.name ?? null,
          }))}
        />
      </CardContent>
    </Card>
  );
}
