"use client";

import { Button } from "@/components/ui/button";
import { FormPendingOverlay } from "@/components/loading-overlay";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToastActionState } from "@/hooks/use-toast-action-state";
import type { FormState } from "./actions";

interface ChurchFormProps {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  withAdmin?: boolean;
  defaultValues?: {
    name: string;
    plan: string;
    status: "TRIAL" | "ATIVA" | "SUSPENSA";
    expiresAt: string;
    notes: string;
  };
  submitLabel?: string;
}

const initialState: FormState = {};

const fieldClass =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ChurchForm({
  action,
  withAdmin = false,
  defaultValues,
  submitLabel = "Salvar",
}: ChurchFormProps) {
  const [state, formAction, isPending] = useToastActionState(
    action,
    initialState,
    "Igreja atualizada com sucesso."
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da igreja</Label>
        <Input id="name" name="name" required defaultValue={defaultValues?.name} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="plan">Plano</Label>
          <Input id="plan" name="plan" required defaultValue={defaultValues?.plan ?? "basico"} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={defaultValues?.status ?? "TRIAL"}
            className={fieldClass}
          >
            <option value="TRIAL">Em teste</option>
            <option value="ATIVA">Ativa</option>
            <option value="SUSPENSA">Suspensa</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="expiresAt">Vencimento (opcional)</Label>
        <Input
          id="expiresAt"
          name="expiresAt"
          type="date"
          defaultValue={defaultValues?.expiresAt}
        />
        <p className="text-xs text-muted-foreground">
          Após esta data o acesso da igreja é bloqueado.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Observações (opcional)</Label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={defaultValues?.notes}
          className={fieldClass}
        />
      </div>

      {withAdmin && (
        <>
          <div className="space-y-2">
            <Label htmlFor="adminName">Nome do administrador</Label>
            <Input id="adminName" name="adminName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminEmail">E-mail do administrador</Label>
            <Input id="adminEmail" name="adminEmail" type="email" required />
          </div>
        </>
      )}

      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <FormPendingOverlay />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}
