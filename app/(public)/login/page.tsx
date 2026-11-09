import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-gradient-to-b from-primary/10 via-background to-background px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center justify-items-center text-center">
          <Image
            src="/escalai_icon.svg"
            alt=""
            width={64}
            height={64}
            priority
            className="mb-2 rounded-2xl"
          />
          <CardTitle className="text-2xl">Escalaí</CardTitle>
          <p className="text-sm text-muted-foreground">Sua escala tá aí.</p>
          <CardDescription>Entre com seu e-mail e senha</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
