"use client";

import { useTransition, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { LoadingOverlay } from "@/components/loading-overlay";
import { getReadableTextColor } from "@/lib/department-colors";

interface DepartmentMonthCalendarProps {
  basePath: string;
  // "YYYY-MM"
  month: string;
  // "YYYY-MM-DD" of every day that has a schedule entry (visible weeks only)
  markedDates: string[];
  // "YYYY-MM-DD" or null
  selected: string | null;
  color: string;
}

function toLocalDate(value: string) {
  const [year, month, day = "1"] = value.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function DepartmentMonthCalendar({
  basePath,
  month,
  markedDates,
  selected,
  color,
}: DepartmentMonthCalendarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function go(params: { mes: string; data?: string }) {
    const query = new URLSearchParams({ mes: params.mes });
    if (params.data) query.set("data", params.data);
    startTransition(() => {
      router.push(`${basePath}?${query.toString()}`, { scroll: false });
    });
  }

  const marked: CSSProperties = { backgroundColor: color, color: getReadableTextColor(color) };

  return (
    <div>
      <LoadingOverlay show={isPending} />
      <Calendar
        month={toLocalDate(month)}
        onMonthChange={(next) => go({ mes: `${next.getFullYear()}-${pad(next.getMonth() + 1)}` })}
        selected={selected ? toLocalDate(selected) : undefined}
        onDayClick={(day) =>
          go({
            mes: `${day.getFullYear()}-${pad(day.getMonth() + 1)}`,
            data: `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`,
          })
        }
        mode="single"
        locale={ptBR}
        modifiers={{ marked: markedDates.map(toLocalDate) }}
        modifiersStyles={{ marked }}
        className="mx-auto w-full max-w-none [--cell-size:--spacing(10)]"
      />
    </div>
  );
}
