import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_PASSWORD } from "@/lib/password";
import { ChurchForm } from "../../church-form";
import { createChurchAction } from "../../actions";

export default function NovaIgrejaPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova igreja</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          O administrador será criado com a senha padrão <strong>{DEFAULT_PASSWORD}</strong> e
          precisará trocá-la no primeiro login.
        </p>
        <ChurchForm action={createChurchAction} withAdmin submitLabel="Criar igreja" />
      </CardContent>
    </Card>
  );
}
