import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DepartmentForm } from "../department-form";
import { createDepartmentAction } from "../actions";

export default function NovoDepartamentoPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo departamento</CardTitle>
      </CardHeader>
      <CardContent>
        <DepartmentForm action={createDepartmentAction} submitLabel="Criar departamento" />
      </CardContent>
    </Card>
  );
}
