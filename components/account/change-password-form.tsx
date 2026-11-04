"use client";

import { Button } from "@/components/ui/button";
import { FormPendingOverlay } from "@/components/loading-overlay";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToastActionState } from "@/hooks/use-toast-action-state";

export interface ChangePasswordState {
  error?: string;
  success?: boolean;
}

interface ChangePasswordFormProps {
  action: (
    prevState: ChangePasswordState,
    formData: FormData
  ) => Promise<ChangePasswordState>;
  submitLabel?: string;
}

const initialState: ChangePasswordState = {};

export function ChangePasswordForm({
  action,
  submitLabel = "Salvar nova senha",
}: ChangePasswordFormProps) {
  const [state, formAction, isPending] = useToastActionState(
    action,
    initialState,
    "Senha alterada com sucesso."
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Senha atual</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">Nova senha</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <FormPendingOverlay />
      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}
