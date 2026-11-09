import type { ChurchStatus } from "@prisma/client";

export function isChurchBlocked(
  church: { status: ChurchStatus; expiresAt: Date | null } | null
) {
  if (!church) return false;
  if (church.status === "SUSPENSA") return true;
  return !!church.expiresAt && church.expiresAt < new Date();
}

export const CHURCH_STATUS_LABEL: Record<ChurchStatus, string> = {
  TRIAL: "Em teste",
  ATIVA: "Ativa",
  SUSPENSA: "Suspensa",
};
