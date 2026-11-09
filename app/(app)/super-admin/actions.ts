"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateTempPassword, DEFAULT_PASSWORD } from "@/lib/password";
import {
  churchSchema,
  createChurchSchema,
  churchAdminSchema,
  slugify,
  parseExpiresAt,
} from "@/lib/validations/church";
import { redirectWithToast } from "@/lib/toast-redirect";

export interface FormState {
  error?: string;
  success?: boolean;
}

export interface ResetPasswordState {
  error?: string;
  tempPassword?: string;
}

async function uniqueSlug(name: string) {
  const base = slugify(name) || "igreja";
  let slug = base;
  for (let i = 2; await prisma.church.findUnique({ where: { slug }, select: { id: true } }); i++) {
    slug = `${base}-${i}`;
  }
  return slug;
}

export async function createChurchAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireSuperAdmin();

  const parsed = createChurchSchema.safeParse({
    name: formData.get("name"),
    plan: formData.get("plan"),
    status: formData.get("status"),
    expiresAt: formData.get("expiresAt") || undefined,
    notes: formData.get("notes") || undefined,
    adminName: formData.get("adminName"),
    adminEmail: formData.get("adminEmail"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { adminName, adminEmail, expiresAt, ...churchData } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    return { error: "Já existe um usuário com este e-mail." };
  }

  const passwordHash = await hashPassword(DEFAULT_PASSWORD);
  const slug = await uniqueSlug(churchData.name);

  const church = await prisma.church.create({
    data: {
      ...churchData,
      slug,
      expiresAt: parseExpiresAt(expiresAt),
      users: {
        create: {
          name: adminName,
          email: adminEmail,
          passwordHash,
          isAdmin: true,
          mustChangePassword: true,
        },
      },
    },
  });

  revalidatePath("/super-admin");
  redirectWithToast(`/super-admin/igrejas/${church.id}`, "success", "Igreja criada com sucesso.");
}

export async function updateChurchAction(
  churchId: number,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireSuperAdmin();

  const parsed = churchSchema.safeParse({
    name: formData.get("name"),
    plan: formData.get("plan"),
    status: formData.get("status"),
    expiresAt: formData.get("expiresAt") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { expiresAt, notes, ...rest } = parsed.data;

  const { count } = await prisma.church.updateMany({
    where: { id: churchId },
    data: { ...rest, notes: notes ?? null, expiresAt: parseExpiresAt(expiresAt) },
  });
  if (count === 0) {
    return { error: "Igreja não encontrada." };
  }

  revalidatePath("/super-admin");
  revalidatePath(`/super-admin/igrejas/${churchId}`);
  return { success: true };
}

export async function addChurchAdminAction(
  churchId: number,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireSuperAdmin();

  const parsed = churchAdminSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const church = await prisma.church.findUnique({ where: { id: churchId }, select: { id: true } });
  if (!church) {
    return { error: "Igreja não encontrada." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "Já existe um usuário com este e-mail." };
  }

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(DEFAULT_PASSWORD),
      isAdmin: true,
      mustChangePassword: true,
      churchId,
    },
  });

  revalidatePath(`/super-admin/igrejas/${churchId}`);
  return { success: true };
}

export async function resetChurchAdminPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  await requireSuperAdmin();
  const userId = Number(formData.get("userId"));

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  const { count } = await prisma.user.updateMany({
    where: { id: userId, isAdmin: true, isSuperAdmin: false, churchId: { not: null } },
    data: { passwordHash, mustChangePassword: true },
  });
  if (count === 0) {
    return { error: "Administrador não encontrado." };
  }

  return { tempPassword };
}
