import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserForm } from "../user-form";
import { createUserAction } from "../actions";
import { DEFAULT_PASSWORD } from "@/lib/password";

export default function NovoUsuarioPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo membro</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          O membro será criado com a senha padrão <strong>{DEFAULT_PASSWORD}</strong> e
          precisará trocá-la no primeiro login.
        </p>
        <UserForm action={createUserAction} submitLabel="Criar membro" />
      </CardContent>
    </Card>
  );
}
