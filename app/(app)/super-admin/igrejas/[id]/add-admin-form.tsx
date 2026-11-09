"use client";

import { Button } from "@/components/ui/button";
import { FormPendingOverlay } from "@/components/loading-overlay";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToastActionState } from "@/hooks/use-toast-action-state";
import { addChurchAdminAction, type FormState } from "../../actions";

const initialState: FormState = {};

export function AddAdminForm({ churchId }: { churchId: number }) {
  const [state, formAction, isPending] = useToastActionState(
    addChurchAdminAction.bind(null, churchId),
    initialState,
    "Administrador adicionado."
  );

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="admin-name">Nome</Label>
        <Input id="admin-name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="admin-email">E-mail</Label>
        <Input id="admin-email" name="email" type="email" required />
      </div>
      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <FormPendingOverlay />
      <Button type="submit" variant="outline" disabled={isPending}>
        {isPending ? "Adicionando..." : "Adicionar administrador"}
      </Button>
    </form>
  );
}
