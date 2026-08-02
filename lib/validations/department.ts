import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().min(1, "Informe o nome do departamento"),
  description: z.string().optional(),
});

export type DepartmentInput = z.infer<typeof departmentSchema>;

export const membershipSchema = z.object({
  userId: z.coerce.number().int().positive(),
  departmentId: z.coerce.number().int().positive(),
  role: z.enum(["LIDER", "MEMBRO"]),
});

export type MembershipInput = z.infer<typeof membershipSchema>;
