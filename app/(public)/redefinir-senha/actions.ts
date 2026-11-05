"use server";

import { resetPasswordWithToken } from "@/lib/password-reset";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { redirectWithToast } from "@/lib/toast-redirect";

export interface ResetPasswordState {
  error?: string;
}

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const result = await resetPasswordWithToken(parsed.data.token, parsed.data.newPassword);
  if (result.error) {
    return { error: result.error };
  }

  redirectWithToast("/login", "success", "Senha redefinida. Entre com a nova senha.");
}
