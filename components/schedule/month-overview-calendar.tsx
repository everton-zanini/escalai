"use client";

import type { CSSProperties } from "react";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { getReadableTextColor } from "@/lib/department-colors";

interface MonthOverviewCalendarProps {
  days: { date: string; color: string; departmentName: string }[];
}

export function MonthOverviewCalendar({ days }: MonthOverviewCalendarProps) {
  const byColor = new Map<string, Date[]>();
  for (const day of days) {
    const [year, month, dayOfMonth] = day.date.split("-").map(Number);
    const list = byColor.get(day.color) ?? [];
    list.push(new Date(year, month - 1, dayOfMonth));
    byColor.set(day.color, list);
  }

  const modifiers: Record<string, Date[]> = {};
  const modifiersStyles: Record<string, CSSProperties> = {};
  let index = 0;
  for (const [color, dates] of byColor) {
    const key = `color-${index}`;
    modifiers[key] = dates;
    modifiersStyles[key] = { backgroundColor: color, color: getReadableTextColor(color) };
    index += 1;
  }

  return (
    <Calendar
      month={new Date()}
      locale={ptBR}
      modifiers={modifiers}
      modifiersStyles={modifiersStyles}
      className="mx-auto w-full max-w-none [--cell-size:--spacing(9)]"
    />
  );
}
