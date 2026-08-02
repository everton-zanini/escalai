import { z } from "zod";

export const scheduleEntrySchema = z.object({
  date: z.string().min(1, "Informe a data"),
  title: z.string().optional(),
  note: z.string().optional(),
  assigneeIds: z.array(z.coerce.number().int().positive()).default([]),
});

export type ScheduleEntryInput = z.infer<typeof scheduleEntrySchema>;
