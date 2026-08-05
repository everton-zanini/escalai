"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  departmentSchema,
  createDepartmentSchema,
  membershipSchema,
} from "@/lib/validations/department";
import { redirectWithToast } from "@/lib/toast-redirect";

export interface FormState {
  error?: string;
  success?: boolean;
}

export async function createDepartmentAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = createDepartmentSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    color: formData.get("color"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const department = await prisma.department.create({ data: parsed.data });
  revalidatePath("/admin/departamentos");
  redirectWithToast(
    `/admin/departamentos/${department.id}`,
    "success",
    "Departamento criado com sucesso."
  );
}

export async function updateDepartmentAction(
  departmentId: number,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = departmentSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.department.update({ where: { id: departmentId }, data: parsed.data });
  revalidatePath("/admin/departamentos");
  revalidatePath(`/admin/departamentos/${departmentId}`);
  return { success: true };
}

export async function toggleDepartmentActiveAction(formData: FormData) {
  await requireAdmin();
  const departmentId = Number(formData.get("departmentId"));

  let nextActive = false;
  try {
    const department = await prisma.department.findUniqueOrThrow({ where: { id: departmentId } });
    nextActive = !department.isActive;
    await prisma.department.update({
      where: { id: departmentId },
      data: { isActive: nextActive },
    });
  } catch {
    redirectWithToast(
      `/admin/departamentos/${departmentId}`,
      "error",
      "Não foi possível atualizar o departamento."
    );
  }

  revalidatePath("/admin/departamentos");
  revalidatePath(`/admin/departamentos/${departmentId}`);
  redirectWithToast(
    `/admin/departamentos/${departmentId}`,
    "success",
    nextActive ? "Departamento ativado." : "Departamento desativado."
  );
}

export async function addMembershipAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = membershipSchema.safeParse({
    userId: formData.get("userId"),
    departmentId: formData.get("departmentId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: "Selecione uma pessoa e um papel válidos." };
  }

  await prisma.departmentMembership.upsert({
    where: {
      userId_departmentId: {
        userId: parsed.data.userId,
        departmentId: parsed.data.departmentId,
      },
    },
    update: { role: parsed.data.role },
    create: parsed.data,
  });

  revalidatePath(`/admin/departamentos/${parsed.data.departmentId}`);
  return { success: true };
}

export async function removeMembershipAction(formData: FormData) {
  await requireAdmin();
  const membershipId = Number(formData.get("membershipId"));
  const departmentId = Number(formData.get("departmentId"));

  try {
    await prisma.departmentMembership.delete({ where: { id: membershipId } });
  } catch {
    redirectWithToast(
      `/admin/departamentos/${departmentId}`,
      "error",
      "Não foi possível remover o membro."
    );
  }

  revalidatePath(`/admin/departamentos/${departmentId}`);
  redirectWithToast(
    `/admin/departamentos/${departmentId}`,
    "success",
    "Membro removido do departamento."
  );
}

export async function toggleMembershipRoleAction(formData: FormData) {
  await requireAdmin();
  const membershipId = Number(formData.get("membershipId"));
  const departmentId = Number(formData.get("departmentId"));
  const nextRole = formData.get("nextRole") as "LIDER" | "MEMBRO";

  try {
    await prisma.departmentMembership.update({
      where: { id: membershipId },
      data: { role: nextRole },
    });
  } catch {
    redirectWithToast(
      `/admin/departamentos/${departmentId}`,
      "error",
      "Não foi possível atualizar o papel do membro."
    );
  }

  revalidatePath(`/admin/departamentos/${departmentId}`);
  redirectWithToast(`/admin/departamentos/${departmentId}`, "success", "Papel atualizado com sucesso.");
}
