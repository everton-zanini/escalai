"use server";

import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { createPasswordResetToken } from "@/lib/password-reset";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export interface ForgotPasswordState {
  error?: string;
  success?: boolean;
}

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "E-mail inválido." };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  if (user?.isActive) {
    try {
      const token = await createPasswordResetToken(user.id);
      if (token) {
        const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
        await sendPasswordResetEmail(
          user.email,
          user.name,
          `${baseUrl}/redefinir-senha?token=${token}`
        );
      }
    } catch (error) {
      console.error("[forgotPasswordAction]", error);
    }
  }

  // Same response whether or not the e-mail exists, to avoid account enumeration.
  return { success: true };
}
