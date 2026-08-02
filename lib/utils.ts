import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDatePtBR(date: Date | string, pattern = "EEEE, d 'de' MMMM") {
  const value = typeof date === "string" ? new Date(date) : date
  // Date-only values (Prisma @db.Date) come back as UTC midnight; read the
  // UTC calendar date directly so formatting doesn't shift a day in local time.
  const calendarDate = new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())
  return format(calendarDate, pattern, { locale: ptBR })
}
