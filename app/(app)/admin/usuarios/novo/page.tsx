import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserForm } from "../user-form";
import { createUserAction } from "../actions";

export default function NovoUsuarioPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo usuário</CardTitle>
      </CardHeader>
      <CardContent>
        <UserForm action={createUserAction} showPassword submitLabel="Criar usuário" />
      </CardContent>
    </Card>
  );
}
