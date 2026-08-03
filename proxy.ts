import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export const proxy = NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.webmanifest|icon$|icon-192|icon-512|apple-icon).*)",
  ],
};
