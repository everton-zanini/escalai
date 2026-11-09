import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Informe o e-mail")
  .email("E-mail inválido")
  .toLowerCase();

export const churchSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da igreja"),
  plan: z.string().trim().min(1, "Informe o plano"),
  status: z.enum(["TRIAL", "ATIVA", "SUSPENSA"], { message: "Status inválido" }),
  expiresAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data de vencimento inválida")
    .optional(),
  notes: z.string().trim().optional(),
});

export const createChurchSchema = churchSchema.extend({
  adminName: z.string().trim().min(1, "Informe o nome do administrador"),
  adminEmail: emailSchema,
});

export const churchAdminSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do administrador"),
  email: emailSchema,
});

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Vence no fim do dia informado.
export function parseExpiresAt(value: string | undefined) {
  return value ? new Date(`${value}T23:59:59.999Z`) : null;
}
