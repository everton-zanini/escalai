"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireDepartmentLeader } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { scheduleEntrySchema } from "@/lib/validations/schedule";

export interface FormState {
  error?: string;
}

async function buildAssignments(departmentId: number, formData: FormData) {
  const [memberships, positions] = await Promise.all([
    prisma.departmentMembership.findMany({ where: { departmentId } }),
    prisma.position.findMany({ where: { departmentId } }),
  ]);
  const assignments: { userId: number; positionId: number | null }[] = [];

  for (const m of memberships) {
    if (formData.get(`assignee-${m.userId}`) == null) continue;

    const selectedPositionIds = positions
      .filter((p) => formData.get(`position-${m.userId}-${p.id}`) != null)
      .map((p) => p.id);

    if (selectedPositionIds.length === 0) {
      assignments.push({ userId: m.userId, positionId: null });
    } else {
      for (const positionId of selectedPositionIds) {
        assignments.push({ userId: m.userId, positionId });
      }
    }
  }

  return assignments;
}

async function findCrossDepartmentConflict(
  departmentId: number,
  userIds: number[],
  date: Date,
  excludeEntryId?: number
) {
  if (userIds.length === 0) return null;

  const conflicts = await prisma.scheduleAssignment.findMany({
    where: {
      userId: { in: userIds },
      scheduleEntry: {
        date,
        departmentId: { not: departmentId },
        id: excludeEntryId ? { not: excludeEntryId } : undefined,
      },
    },
    include: { user: true, scheduleEntry: { include: { department: true } } },
  });

  if (conflicts.length === 0) return null;

  const c = conflicts[0];
  return `${c.user.name} já está escalado(a) em ${c.scheduleEntry.department.name} neste dia.`;
}

export async function createEntryAction(
  departmentId: number,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireDepartmentLeader(departmentId);

  const parsed = scheduleEntrySchema.safeParse({
    date: formData.get("date"),
    title: formData.get("title") || undefined,
    note: formData.get("note") || undefined,
    assignments: await buildAssignments(departmentId, formData),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const date = new Date(parsed.data.date);
  const conflictError = await findCrossDepartmentConflict(
    departmentId,
    parsed.data.assignments.map((a) => a.userId),
    date
  );
  if (conflictError) {
    return { error: conflictError };
  }

  await prisma.scheduleEntry.create({
    data: {
      departmentId,
      date,
      title: parsed.data.title ?? null,
      note: parsed.data.note ?? null,
      createdById: Number(user.id),
      assignments: {
        create: parsed.data.assignments.map((a) => ({
          userId: a.userId,
          positionId: a.positionId,
        })),
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
    assignments: await buildAssignments(departmentId, formData),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const date = new Date(parsed.data.date);
  const conflictError = await findCrossDepartmentConflict(
    departmentId,
    parsed.data.assignments.map((a) => a.userId),
    date,
    entryId
  );
  if (conflictError) {
    return { error: conflictError };
  }

  await prisma.$transaction([
    prisma.scheduleAssignment.deleteMany({ where: { scheduleEntryId: entryId } }),
    prisma.scheduleEntry.update({
      where: { id: entryId },
      data: {
        date,
        title: parsed.data.title ?? null,
        note: parsed.data.note ?? null,
        assignments: {
          create: parsed.data.assignments.map((a) => ({
            userId: a.userId,
            positionId: a.positionId,
          })),
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
