"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { availabilityRequestSchema } from "@/lib/validations/availability";
import { redirectWithToast } from "@/lib/toast-redirect";

export interface FormState {
  error?: string;
}

export async function createAvailabilityRequestAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();

  const parsed = availabilityRequestSchema.safeParse({
    departmentIds: formData.getAll("departmentIds"),
    date: formData.get("date"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const membershipCount = await prisma.departmentMembership.count({
    where: { userId: Number(user.id), departmentId: { in: parsed.data.departmentIds } },
  });
  if (membershipCount !== parsed.data.departmentIds.length) {
    return { error: "Departamento inválido." };
  }

  const date = new Date(parsed.data.date);

  const existing = await prisma.availabilityRequest.findFirst({
    where: {
      userId: Number(user.id),
      departmentId: { in: parsed.data.departmentIds },
      date,
      status: { in: ["PENDENTE", "APROVADA"] },
    },
    include: { department: true },
  });

  if (existing) {
    return {
      error: `Já existe uma solicitação para ${existing.department.name} nesta data.`,
    };
  }

  await prisma.availabilityRequest.createMany({
    data: parsed.data.departmentIds.map((departmentId) => ({
      userId: Number(user.id),
      departmentId,
      date,
      reason: parsed.data.reason,
    })),
  });

  revalidatePath("/indisponibilidades");
  redirectWithToast("/indisponibilidades", "success", "Solicitação de ausência enviada.");
}

export async function deleteAvailabilityRequestAction(formData: FormData) {
  const user = await requireUser();
  const requestId = Number(formData.get("requestId"));

  const request = await prisma.availabilityRequest.findUnique({ where: { id: requestId } });

  if (!request || request.userId !== Number(user.id) || request.status !== "PENDENTE") {
    redirectWithToast(
      "/indisponibilidades",
      "error",
      "Não foi possível cancelar esta solicitação."
    );
  }

  try {
    await prisma.availabilityRequest.delete({ where: { id: requestId } });
  } catch {
    redirectWithToast(
      "/indisponibilidades",
      "error",
      "Não foi possível cancelar esta solicitação."
    );
  }

  revalidatePath("/indisponibilidades");
  redirectWithToast("/indisponibilidades", "success", "Solicitação cancelada.");
}
