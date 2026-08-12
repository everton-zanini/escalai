import { z } from "zod";

export const availabilityRequestSchema = z.object({
  departmentIds: z
    .array(z.coerce.number().int().positive())
    .min(1, "Selecione ao menos um departamento"),
  date: z.string().min(1, "Informe a data"),
  reason: z.string().trim().min(3, "Informe o motivo"),
});

export type AvailabilityRequestInput = z.infer<typeof availabilityRequestSchema>;
