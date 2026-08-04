"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { formatDatePtBR, formatDateParam } from "@/lib/utils";

interface DateDayNavProps {
  date: Date;
  basePath: string;
}

export function DateDayNav({ date, basePath }: DateDayNavProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const localDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

  function goTo(target: Date) {
    router.push(`${basePath}?data=${formatDateParam(target)}`);
  }

  function shiftDays(amount: number) {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + amount);
    goTo(next);
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        variant="outline"
        size="icon"
        aria-label="Dia anterior"
        onClick={() => shiftDays(-1)}
      >
        <ChevronLeft className="size-4" />
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button variant="outline" className="flex-1 justify-center gap-2 capitalize">
              <CalendarDays className="size-4" />
              {formatDatePtBR(date)}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            locale={ptBR}
            selected={localDate}
            onSelect={(selected) => {
              if (!selected) return;
              goTo(new Date(Date.UTC(selected.getFullYear(), selected.getMonth(), selected.getDate())));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="icon"
        aria-label="Próximo dia"
        onClick={() => shiftDays(1)}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
