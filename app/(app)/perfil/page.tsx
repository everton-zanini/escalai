import { requireUser } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { changePasswordAction } from "./actions";

export default async function PerfilPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto w-full max-w-sm space-y-4 p-4 md:max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {user.isAdmin && <Badge>Admin</Badge>}
          {user.departmentRoles.map((d) => (
            <Badge key={d.departmentId} variant="secondary">
              {d.departmentName} · {d.role === "LIDER" ? "Líder" : "Membro"}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trocar senha</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm action={changePasswordAction} />
        </CardContent>
      </Card>
    </div>
  );
}
