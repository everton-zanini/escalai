import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

const TOKEN_TTL_MS = 60 * 60 * 1000;
const MIN_INTERVAL_MS = 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Returns the raw token, or null when a token was requested less than a minute ago. */
export async function createPasswordResetToken(userId: number): Promise<string | null> {
  const recent = await prisma.passwordResetToken.findFirst({
    where: { userId, createdAt: { gt: new Date(Date.now() - MIN_INTERVAL_MS) } },
    select: { id: true },
  });
  if (recent) return null;

  const token = randomBytes(32).toString("hex");
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId, usedAt: null } }),
    prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    }),
  ]);
  return token;
}

export async function isPasswordResetTokenValid(token: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { usedAt: true, expiresAt: true },
  });
  return !!record && !record.usedAt && record.expiresAt > new Date();
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{ error?: string }> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { isActive: true } } },
  });

  if (!record || record.usedAt || record.expiresAt <= new Date() || !record.user.isActive) {
    return { error: "Link inválido ou expirado. Solicite um novo." };
  }

  const passwordHash = await hashPassword(newPassword);

  // updateMany with usedAt: null makes the token single-use even under concurrent requests.
  const claimed = await prisma.$transaction(async (tx) => {
    const { count } = await tx.passwordResetToken.updateMany({
      where: { id: record.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    if (count === 0) return false;
    await tx.user.update({
      where: { id: record.userId },
      data: { passwordHash, mustChangePassword: false },
    });
    return true;
  });

  if (!claimed) {
    return { error: "Link inválido ou expirado. Solicite um novo." };
  }
  return {};
}
