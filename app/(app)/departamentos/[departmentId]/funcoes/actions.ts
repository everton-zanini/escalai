"use server";

import { revalidatePath } from "next/cache";
import { requireDepartmentLeader } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { positionSchema } from "@/lib/validations/position";

export interface FormState {
  error?: string;
  success?: boolean;
}

export async function createPositionAction(
  departmentId: number,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireDepartmentLeader(departmentId);

  const parsed = positionSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const existing = await prisma.position.findUnique({
    where: { departmentId_name: { departmentId, name: parsed.data.name } },
  });
  if (existing) {
    return { error: "Já existe uma função com esse nome neste departamento." };
  }

  await prisma.position.create({ data: { departmentId, name: parsed.data.name } });

  revalidatePath(`/departamentos/${departmentId}/funcoes`);
  return { success: true };
}

export async function deletePositionAction(formData: FormData) {
  const departmentId = Number(formData.get("departmentId"));
  const positionId = Number(formData.get("positionId"));

  await requireDepartmentLeader(departmentId);
  await prisma.position.delete({ where: { id: positionId } });

  revalidatePath(`/departamentos/${departmentId}/funcoes`);
}
