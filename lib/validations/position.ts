import { z } from "zod";

export const positionSchema = z.object({
  name: z.string().min(1, "Informe o nome da função"),
});

export type PositionInput = z.infer<typeof positionSchema>;
