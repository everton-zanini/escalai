"use client";

import { Button } from "@/components/ui/button";
import { FormPendingOverlay } from "@/components/loading-overlay";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToastActionState } from "@/hooks/use-toast-action-state";
import type { FormState } from "./actions";

interface UserFormProps {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  defaultValues?: { name: string; email: string };
  submitLabel?: string;
}

const initialState: FormState = {};

export function UserForm({
  action,
  defaultValues,
  submitLabel = "Salvar",
}: UserFormProps) {
  const [state, formAction, isPending] = useToastActionState(
    action,
    initialState,
    "Membro atualizado com sucesso."
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" required defaultValue={defaultValues?.name} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={defaultValues?.email}
        />
      </div>
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
