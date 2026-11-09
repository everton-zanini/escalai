import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isChurchBlocked } from "@/lib/church";

// isAdmin, isSuperAdmin e churchId vêm do banco (não do JWT) para refletir
// mudanças e suspensão da igreja sem exigir novo login.
export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: {
      isAdmin: true,
      isSuperAdmin: true,
      mustChangePassword: true,
      churchId: true,
      church: { select: { status: true, expiresAt: true } },
    },
  });

  if (!dbUser) {
    redirect("/login");
  }

  if (!dbUser.isSuperAdmin && isChurchBlocked(dbUser.church)) {
    redirect("/igreja-suspensa");
  }

  return {
    ...session.user,
    isAdmin: dbUser.isAdmin,
    isSuperAdmin: dbUser.isSuperAdmin,
    mustChangePassword: dbUser.mustChangePassword,
    churchId: dbUser.churchId,
  };
}

export async function requireSuperAdmin() {
  const user = await requireUser();
  if (!user.isSuperAdmin) {
    notFound();
  }
  return user;
}

// Admin da própria igreja. churchId garantido não nulo.
export async function requireAdmin() {
  const user = await requireUser();
  if (!user.isAdmin || user.churchId === null) {
    notFound();
  }
  return { ...user, churchId: user.churchId };
}

// Usuário de igreja (não nula). Super-admin sem igreja não usa as telas de igreja.
export async function requireChurchUser() {
  const user = await requireUser();
  if (user.churchId === null) {
    notFound();
  }
  return { ...user, churchId: user.churchId };
}

export async function requireAnyDepartmentLeader() {
  const user = await requireChurchUser();
  if (user.isAdmin) return user;

  if (!user.departmentRoles.some((d) => d.role === "LIDER")) {
    notFound();
  }

  return user;
}

async function requireDepartmentInChurch(departmentId: number, churchId: number | null) {
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    select: { churchId: true },
  });

  if (!department || churchId === null || department.churchId !== churchId) {
    notFound();
  }
}

export async function requireDepartmentLeader(departmentId: number) {
  const user = await requireUser();
  await requireDepartmentInChurch(departmentId, user.churchId);
  if (user.isAdmin) return user;

  const membership = await prisma.departmentMembership.findUnique({
    where: { userId_departmentId: { userId: Number(user.id), departmentId } },
  });

  if (!membership || membership.role !== "LIDER") {
    notFound();
  }

  return user;
}

export async function requireDepartmentMember(departmentId: number) {
  const user = await requireUser();
  await requireDepartmentInChurch(departmentId, user.churchId);
  if (user.isAdmin) return user;

  const membership = await prisma.departmentMembership.findUnique({
    where: { userId_departmentId: { userId: Number(user.id), departmentId } },
  });

  if (!membership) {
    notFound();
  }

  return user;
}
