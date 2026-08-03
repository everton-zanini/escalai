import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  email: z
    .string()
    .trim()
    .min(1, "Informe o e-mail")
    .email("E-mail inválido")
    .toLowerCase(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  email: z
    .string()
    .trim()
    .min(1, "Informe o e-mail")
    .email("E-mail inválido")
    .toLowerCase(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
