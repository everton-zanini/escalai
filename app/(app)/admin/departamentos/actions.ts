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
  const admin = await requireAdmin();

  const parsed = createDepartmentSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    color: formData.get("color"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const duplicate = await prisma.department.findFirst({
    where: { churchId: admin.churchId, name: parsed.data.name },
    select: { id: true },
  });
  if (duplicate) {
    return { error: "Já existe um departamento com este nome." };
  }

  const department = await prisma.department.create({
    data: { ...parsed.data, churchId: admin.churchId },
  });
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
  const admin = await requireAdmin();

  const parsed = departmentSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const duplicate = await prisma.department.findFirst({
    where: { churchId: admin.churchId, name: parsed.data.name, id: { not: departmentId } },
    select: { id: true },
  });
  if (duplicate) {
    return { error: "Já existe um departamento com este nome." };
  }

  const { count } = await prisma.department.updateMany({
    where: { id: departmentId, churchId: admin.churchId },
    data: parsed.data,
  });
  if (count === 0) {
    return { error: "Departamento não encontrado." };
  }
  revalidatePath("/admin/departamentos");
  revalidatePath(`/admin/departamentos/${departmentId}`);
  return { success: true };
}

export async function toggleDepartmentActiveAction(formData: FormData) {
  const admin = await requireAdmin();
  const departmentId = Number(formData.get("departmentId"));

  let nextActive = false;
  try {
    const department = await prisma.department.findFirstOrThrow({
      where: { id: departmentId, churchId: admin.churchId },
    });
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
  const admin = await requireAdmin();

  const parsed = membershipSchema.safeParse({
    userId: formData.get("userId"),
    departmentId: formData.get("departmentId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: "Selecione uma pessoa e um papel válidos." };
  }

  const [department, member] = await Promise.all([
    prisma.department.findFirst({
      where: { id: parsed.data.departmentId, churchId: admin.churchId },
      select: { id: true },
    }),
    prisma.user.findFirst({
      where: { id: parsed.data.userId, churchId: admin.churchId },
      select: { id: true },
    }),
  ]);
  if (!department || !member) {
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
  const admin = await requireAdmin();
  const membershipId = Number(formData.get("membershipId"));
  const departmentId = Number(formData.get("departmentId"));

  try {
    const { count } = await prisma.departmentMembership.deleteMany({
      where: { id: membershipId, department: { churchId: admin.churchId } },
    });
    if (count === 0) throw new Error("not found");
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
  const admin = await requireAdmin();
  const membershipId = Number(formData.get("membershipId"));
  const departmentId = Number(formData.get("departmentId"));
  const nextRole = formData.get("nextRole") as "LIDER" | "MEMBRO";

  try {
    const { count } = await prisma.departmentMembership.updateMany({
      where: { id: membershipId, department: { churchId: admin.churchId } },
      data: { role: nextRole },
    });
    if (count === 0) throw new Error("not found");
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
