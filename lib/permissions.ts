import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user.isAdmin) {
    notFound();
  }
  return user;
}

export async function requireAnyDepartmentLeader() {
  const user = await requireUser();
  if (user.isAdmin) return user;

  if (!user.departmentRoles.some((d) => d.role === "LIDER")) {
    notFound();
  }

  return user;
}

export async function requireDepartmentLeader(departmentId: number) {
  const user = await requireUser();
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
  if (user.isAdmin) return user;

  const membership = await prisma.departmentMembership.findUnique({
    where: { userId_departmentId: { userId: Number(user.id), departmentId } },
  });

  if (!membership) {
    notFound();
  }

  return user;
}
