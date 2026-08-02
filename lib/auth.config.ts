import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = request.nextUrl.pathname === "/login";
      const isOnAdmin = request.nextUrl.pathname.startsWith("/admin");

      if (isOnLogin) {
        return true;
      }

      if (!isLoggedIn) {
        return false;
      }

      if (isOnAdmin && !auth.user.isAdmin) {
        return Response.redirect(new URL("/", request.nextUrl));
      }

      return true;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.isAdmin = token.isAdmin;
      session.user.mustChangePassword = token.mustChangePassword;
      session.user.departmentRoles = token.departmentRoles;
      return session;
    },
  },
} satisfies NextAuthConfig;
