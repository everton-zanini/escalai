import { redirect } from "next/navigation";
import { requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { forcedChangePasswordAction } from "./actions";

export default async function TrocarSenhaObrigatoriaPage() {
  const user = await requireUser();

  // Check the DB fresh, not the JWT claim, which is a stale snapshot from login time.
  const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: Number(user.id) } });
  if (!dbUser.mustChangePassword) {
    redirect("/");
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Defina uma nova senha</CardTitle>
          <CardDescription>
            Sua senha foi redefinida pelo administrador. Informe a senha
            temporária e escolha uma nova senha para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm
            action={forcedChangePasswordAction}
            submitLabel="Definir nova senha"
          />
        </CardContent>
      </Card>
    </main>
  );
}
