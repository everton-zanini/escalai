"use server";

import { requireUser } from "@/lib/permissions";
import { changeOwnPassword } from "@/lib/change-password";
import { changePasswordSchema } from "@/lib/validations/password";
import type { ChangePasswordState } from "@/components/account/change-password-form";

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const user = await requireUser();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const result = await changeOwnPassword(
    Number(user.id),
    parsed.data.currentPassword,
    parsed.data.newPassword
  );

  if (result.error) {
    return { error: result.error };
  }

  return { success: true };
}
