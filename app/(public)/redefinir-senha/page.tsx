import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isPasswordResetTokenValid } from "@/lib/password-reset";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  const { token } = await searchParams;
  const valid = token ? await isPasswordResetTokenValid(token) : false;

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-gradient-to-b from-primary/10 via-background to-background px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Redefinir senha</CardTitle>
          <CardDescription>
            {valid ? "Escolha uma nova senha" : "Link inválido ou expirado"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {valid && token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <Link href="/esqueci-senha" className="block text-center text-sm text-primary hover:underline">
              Solicitar novo link
            </Link>
          )}
          <Link href="/login" className="block text-center text-sm text-muted-foreground hover:underline">
            Voltar ao login
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
