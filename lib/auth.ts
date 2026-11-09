import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validations/auth";
import type { DepartmentRoleClaim } from "@/types/next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) return null;

        const passwordMatches = await verifyPassword(password, user.passwordHash);
        if (!passwordMatches) return null;

        const memberships = await prisma.departmentMembership.findMany({
          where: { userId: user.id },
          include: { department: true },
        });

        const departmentRoles: DepartmentRoleClaim[] = memberships.map((m) => ({
          departmentId: m.departmentId,
          departmentName: m.department.name,
          role: m.role,
        }));

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          isSuperAdmin: user.isSuperAdmin,
          churchId: user.churchId,
          mustChangePassword: user.mustChangePassword,
          departmentRoles,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        token.isSuperAdmin = user.isSuperAdmin;
        token.churchId = user.churchId;
        token.mustChangePassword = user.mustChangePassword;
        token.departmentRoles = user.departmentRoles;
      }
      return token;
    },
  },
});
