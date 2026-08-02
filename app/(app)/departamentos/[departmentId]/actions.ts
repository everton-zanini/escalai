"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireDepartmentLeader } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { scheduleEntrySchema } from "@/lib/validations/schedule";

export interface FormState {
  error?: string;
}

export async function createEntryAction(
  departmentId: number,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireDepartmentLeader(departmentId);

  const parsed = scheduleEntrySchema.safeParse({
    date: formData.get("date"),
    title: formData.get("title") || undefined,
    note: formData.get("note") || undefined,
    assigneeIds: formData.getAll("assigneeIds"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const user = await requireDepartmentLeader(departmentId);

  await prisma.scheduleEntry.create({
    data: {
      departmentId,
      date: new Date(parsed.data.date),
      title: parsed.data.title ?? null,
      note: parsed.data.note ?? null,
      createdById: Number(user.id),
      assignments: {
        create: parsed.data.assigneeIds.map((userId) => ({ userId })),
      },
    },
  });

  revalidatePath(`/departamentos/${departmentId}`);
  redirect(`/departamentos/${departmentId}`);
}

export async function updateEntryAction(
  departmentId: number,
  entryId: number,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireDepartmentLeader(departmentId);

  const parsed = scheduleEntrySchema.safeParse({
    date: formData.get("date"),
    title: formData.get("title") || undefined,
    note: formData.get("note") || undefined,
    assigneeIds: formData.getAll("assigneeIds"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.$transaction([
    prisma.scheduleAssignment.deleteMany({ where: { scheduleEntryId: entryId } }),
    prisma.scheduleEntry.update({
      where: { id: entryId },
      data: {
        date: new Date(parsed.data.date),
        title: parsed.data.title ?? null,
        note: parsed.data.note ?? null,
        assignments: {
          create: parsed.data.assigneeIds.map((userId) => ({ userId })),
        },
      },
    }),
  ]);

  revalidatePath(`/departamentos/${departmentId}`);
  redirect(`/departamentos/${departmentId}`);
}

export async function deleteEntryAction(formData: FormData) {
  const departmentId = Number(formData.get("departmentId"));
  const entryId = Number(formData.get("entryId"));

  await requireDepartmentLeader(departmentId);
  await prisma.scheduleEntry.delete({ where: { id: entryId } });

  revalidatePath(`/departamentos/${departmentId}`);
  redirect(`/departamentos/${departmentId}`);
}
