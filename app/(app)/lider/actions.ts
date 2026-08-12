"use server";

import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireDepartmentLeader } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { redirectWithToast } from "@/lib/toast-redirect";

export async function reviewAvailabilityRequestAction(
  requestId: number,
  decision: "APROVADA" | "RECUSADA"
) {
  const request = await prisma.availabilityRequest.findUnique({ where: { id: requestId } });
  if (!request) notFound();

  const user = await requireDepartmentLeader(request.departmentId);

  await prisma.availabilityRequest.update({
    where: { id: requestId },
    data: {
      status: decision,
      reviewedById: Number(user.id),
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/lider");
  redirectWithToast(
    "/lider",
    "success",
    decision === "APROVADA" ? "Ausência aprovada." : "Ausência recusada."
  );
}
