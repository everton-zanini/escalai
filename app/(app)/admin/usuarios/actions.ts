"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateTempPassword, DEFAULT_PASSWORD } from "@/lib/password";
import { createUserSchema, updateUserSchema } from "@/lib/validations/user";
import { redirectWithToast } from "@/lib/toast-redirect";
import { manageableUsersWhere } from "@/lib/tenant";

export interface FormState {
  error?: string;
  success?: boolean;
}

export interface ResetPasswordState {
  error?: string;
  tempPassword?: string;
}

export async function createUserAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireAdmin();

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "Já existe um membro com este e-mail." };
  }

  const passwordHash = await hashPassword(DEFAULT_PASSWORD);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      mustChangePassword: true,
      churchId: admin.churchId,
    },
  });

  revalidatePath("/admin/usuarios");
  redirectWithToast(`/admin/usuarios/${user.id}`, "success", "Membro criado com sucesso.");
}

export async function updateUserAction(
  userId: number,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireAdmin();

  const parsed = updateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing && existing.id !== userId) {
    return { error: "Já existe um membro com este e-mail." };
  }

  const { count } = await prisma.user.updateMany({
    where: { id: userId, ...manageableUsersWhere(admin) },
    data: parsed.data,
  });
  if (count === 0) {
    return { error: "Membro não encontrado." };
  }
  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${userId}`);
  return { success: true };
}

export async function toggleUserActiveAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = Number(formData.get("userId"));

  let nextActive = false;
  try {
    const user = await prisma.user.findFirstOrThrow({
      where: { id: userId, ...manageableUsersWhere(admin) },
    });
    nextActive = !user.isActive;
    await prisma.user.update({ where: { id: userId }, data: { isActive: nextActive } });
  } catch {
    redirectWithToast(
      `/admin/usuarios/${userId}`,
      "error",
      "Não foi possível atualizar o membro."
    );
  }

  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${userId}`);
  redirectWithToast(
    `/admin/usuarios/${userId}`,
    "success",
    nextActive ? "Membro ativado." : "Membro desativado."
  );
}

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const admin = await requireAdmin();
  const userId = Number(formData.get("userId"));

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  const { count } = await prisma.user.updateMany({
    where: { id: userId, ...manageableUsersWhere(admin) },
    data: { passwordHash, mustChangePassword: true },
  });
  if (count === 0) {
    return { error: "Membro não encontrado." };
  }

  revalidatePath(`/admin/usuarios/${userId}`);
  return { tempPassword };
}
