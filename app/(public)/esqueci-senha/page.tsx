import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ForgotPasswordForm } from "./forgot-password-form";

export default async function ForgotPasswordPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-gradient-to-b from-primary/10 via-background to-background px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Esqueci minha senha</CardTitle>
          <CardDescription>Informe seu e-mail para receber o link de redefinição</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ForgotPasswordForm />
          <Link href="/login" className="block text-center text-sm text-muted-foreground hover:underline">
            Voltar ao login
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
