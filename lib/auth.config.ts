import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isOnPublicAuthPage = [
        "/login",
        "/esqueci-senha",
        "/redefinir-senha",
        "/igreja-suspensa",
      ].includes(request.nextUrl.pathname);
      const isOnAdmin = request.nextUrl.pathname.startsWith("/admin");

      if (isOnPublicAuthPage) {
        return true;
      }

      if (!isLoggedIn) {
        return false;
      }

      if (isOnAdmin && !auth.user.isAdmin) {
        return Response.redirect(new URL("/", request.nextUrl));
      }

      // /super-admin é protegido por requireSuperAdmin (lê do banco): o JWT pode
      // estar desatualizado para quem virou super-admin depois do login.
      return true;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.isAdmin = token.isAdmin;
      session.user.isSuperAdmin = token.isSuperAdmin;
      session.user.churchId = token.churchId;
      session.user.mustChangePassword = token.mustChangePassword;
      session.user.departmentRoles = token.departmentRoles;
      return session;
    },
  },
} satisfies NextAuthConfig;
