"use server";

import { revalidatePath } from "next/cache";
import { requireDepartmentLeader } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { scheduleEntrySchema } from "@/lib/validations/schedule";
import { redirectWithToast } from "@/lib/toast-redirect";

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

export async function getUnavailableMembersAction(departmentId: number, date: string) {
  await requireDepartmentLeader(departmentId);

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return [];

  const [, year, month, day] = match;
  const parsedDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  return prisma.availabilityRequest.findMany({
    where: { departmentId, date: parsedDate, status: "APROVADA" },
    select: { userId: true, reason: true },
  });
}

async function findApprovedAbsenceConflict(departmentId: number, userIds: number[], date: Date) {
  if (userIds.length === 0) return null;

  const conflict = await prisma.availabilityRequest.findFirst({
    where: { departmentId, date, status: "APROVADA", userId: { in: userIds } },
    include: { user: true },
  });

  if (!conflict) return null;

  return `${conflict.user.name} está com ausência justificada nesse dia e não pode ser escalado(a).`;
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
    time: formData.get("time") || undefined,
    title: formData.get("title") || undefined,
    note: formData.get("note") || undefined,
    assignments: await buildAssignments(departmentId, formData),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const date = new Date(parsed.data.date);
  const assignedUserIds = parsed.data.assignments.map((a) => a.userId);

  const absenceError = await findApprovedAbsenceConflict(departmentId, assignedUserIds, date);
  if (absenceError) {
    return { error: absenceError };
  }

  const conflictError = await findCrossDepartmentConflict(departmentId, assignedUserIds, date);
  if (conflictError) {
    return { error: conflictError };
  }

  await prisma.scheduleEntry.create({
    data: {
      departmentId,
      date,
      time: parsed.data.time || null,
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
  redirectWithToast(`/departamentos/${departmentId}`, "success", "Escala criada com sucesso.");
}

export async function updateEntryAction(
  departmentId: number,
  entryId: number,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireDepartmentLeader(departmentId);

  const ownEntry = await prisma.scheduleEntry.findFirst({
    where: { id: entryId, departmentId },
    select: { id: true },
  });
  if (!ownEntry) {
    return { error: "Escala não encontrada." };
  }

  const parsed = scheduleEntrySchema.safeParse({
    date: formData.get("date"),
    time: formData.get("time") || undefined,
    title: formData.get("title") || undefined,
    note: formData.get("note") || undefined,
    assignments: await buildAssignments(departmentId, formData),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const date = new Date(parsed.data.date);
  const assignedUserIds = parsed.data.assignments.map((a) => a.userId);

  const absenceError = await findApprovedAbsenceConflict(departmentId, assignedUserIds, date);
  if (absenceError) {
    return { error: absenceError };
  }

  const conflictError = await findCrossDepartmentConflict(
    departmentId,
    assignedUserIds,
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
        time: parsed.data.time || null,
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
  redirectWithToast(`/departamentos/${departmentId}`, "success", "Escala atualizada com sucesso.");
}

export async function deleteEntryAction(formData: FormData) {
  const departmentId = Number(formData.get("departmentId"));
  const entryId = Number(formData.get("entryId"));

  await requireDepartmentLeader(departmentId);

  try {
    const { count } = await prisma.scheduleEntry.deleteMany({
      where: { id: entryId, departmentId },
    });
    if (count === 0) throw new Error("not found");
  } catch {
    redirectWithToast(
      `/departamentos/${departmentId}/${entryId}/editar`,
      "error",
      "Não foi possível excluir a escala."
    );
  }

  revalidatePath(`/departamentos/${departmentId}`);
  redirectWithToast(`/departamentos/${departmentId}`, "success", "Escala excluída com sucesso.");
}
