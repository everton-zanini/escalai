import { z } from "zod";

export const scheduleAssignmentInputSchema = z.object({
  userId: z.coerce.number().int().positive(),
  positionId: z.coerce.number().int().positive().nullable(),
});

export const scheduleEntrySchema = z.object({
  date: z.string().min(1, "Informe a data"),
  title: z.string().optional(),
  note: z.string().optional(),
  assignments: z.array(scheduleAssignmentInputSchema).default([]),
});

export type ScheduleAssignmentInput = z.infer<typeof scheduleAssignmentInputSchema>;
export type ScheduleEntryInput = z.infer<typeof scheduleEntrySchema>;
