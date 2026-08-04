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

export type SchedulePeriod = "dia" | "semana" | "mes" | "todas"

export function getPeriodRange(period: SchedulePeriod) {
  if (period === "todas") return null

  const now = new Date()
  // Same UTC-anchored approach as formatDatePtBR: build boundaries as UTC
  // midnight calendar dates so they line up with how @db.Date columns are stored.
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))

  if (period === "dia") {
    return { from: today, to: today }
  }

  if (period === "semana") {
    const from = new Date(today)
    from.setUTCDate(from.getUTCDate() - today.getUTCDay())
    const to = new Date(from)
    to.setUTCDate(to.getUTCDate() + 6)
    return { from, to }
  }

  const from = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
  const to = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0))
  return { from, to }
}

// Parses a "YYYY-MM-DD" querystring param into a UTC-midnight Date, matching
// how @db.Date columns are stored. Falls back to today when missing/invalid.
export function parseDateParam(raw: string | undefined): Date {
  if (raw) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw)
    if (match) {
      const [, year, month, day] = match
      return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
    }
  }

  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}

export function formatDateParam(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
