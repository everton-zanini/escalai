"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { departmentSchema, membershipSchema } from "@/lib/validations/department";

export interface FormState {
  error?: string;
}

export async function createDepartmentAction(
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

  const department = await prisma.department.create({ data: parsed.data });
  revalidatePath("/admin/departamentos");
  redirect(`/admin/departamentos/${department.id}`);
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
  return {};
}

export async function toggleDepartmentActiveAction(formData: FormData) {
  await requireAdmin();
  const departmentId = Number(formData.get("departmentId"));
  const department = await prisma.department.findUniqueOrThrow({ where: { id: departmentId } });
  await prisma.department.update({
    where: { id: departmentId },
    data: { isActive: !department.isActive },
  });
  revalidatePath("/admin/departamentos");
  revalidatePath(`/admin/departamentos/${departmentId}`);
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
  return {};
}

export async function removeMembershipAction(formData: FormData) {
  await requireAdmin();
  const membershipId = Number(formData.get("membershipId"));
  const departmentId = Number(formData.get("departmentId"));

  await prisma.departmentMembership.delete({ where: { id: membershipId } });
  revalidatePath(`/admin/departamentos/${departmentId}`);
}

export async function toggleMembershipRoleAction(formData: FormData) {
  await requireAdmin();
  const membershipId = Number(formData.get("membershipId"));
  const departmentId = Number(formData.get("departmentId"));
  const nextRole = formData.get("nextRole") as "LIDER" | "MEMBRO";

  await prisma.departmentMembership.update({
    where: { id: membershipId },
    data: { role: nextRole },
  });
  revalidatePath(`/admin/departamentos/${departmentId}`);
}
