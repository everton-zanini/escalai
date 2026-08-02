import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function changeOwnPassword(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<{ error?: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { error: "Membro não encontrado." };
  }

  const currentMatches = await verifyPassword(currentPassword, user.passwordHash);
  if (!currentMatches) {
    return { error: "Senha atual incorreta." };
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, mustChangePassword: false },
  });

  return {};
}
