import { z } from "zod";
import { DEPARTMENT_COLORS } from "@/lib/department-colors";

export const departmentSchema = z.object({
  name: z.string().min(1, "Informe o nome do departamento"),
  description: z.string().optional(),
});

export type DepartmentInput = z.infer<typeof departmentSchema>;

export const createDepartmentSchema = departmentSchema.extend({
  color: z.string().refine((value) => DEPARTMENT_COLORS.includes(value), "Cor inválida"),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;

export const membershipSchema = z.object({
  userId: z.coerce.number().int().positive(),
  departmentId: z.coerce.number().int().positive(),
  role: z.enum(["LIDER", "MEMBRO"]),
});

export type MembershipInput = z.infer<typeof membershipSchema>;
