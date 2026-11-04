"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { LoadingOverlay } from "@/components/loading-overlay";
import { formatDatePtBR, formatDateParam, parseDateParam } from "@/lib/utils";

interface DateDayNavProps {
  date: Date;
  basePath: string;
}

function subscribeNoop() {
  return () => {};
}

function getTodayParam() {
  const now = new Date();
  return formatDateParam(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}

function getServerTodayParam() {
  return null;
}

export function DateDayNav({ date, basePath }: DateDayNavProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  // null on the server: server and client may disagree on "today" near midnight.
  const todayParam = useSyncExternalStore(subscribeNoop, getTodayParam, getServerTodayParam);
  const localDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

  function goTo(target: Date) {
    startTransition(() => {
      router.push(`${basePath}?data=${formatDateParam(target)}`);
    });
  }

  function shiftDays(amount: number) {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + amount);
    goTo(next);
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <LoadingOverlay show={isPending} />
      <Button
        variant="outline"
        size="icon"
        className="size-11 shrink-0"
        aria-label="Dia anterior"
        onClick={() => shiftDays(-1)}
      >
        <ChevronLeft className="size-4" />
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button variant="outline" className="h-11 flex-1 justify-center gap-2 capitalize">
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
        className="size-11 shrink-0"
        aria-label="Próximo dia"
        onClick={() => shiftDays(1)}
      >
        <ChevronRight className="size-4" />
      </Button>

      {todayParam && formatDateParam(date) !== todayParam && (
        <Button variant="secondary" className="h-11 shrink-0" onClick={() => goTo(parseDateParam(todayParam))}>
          Hoje
        </Button>
      )}
    </div>
  );
}
