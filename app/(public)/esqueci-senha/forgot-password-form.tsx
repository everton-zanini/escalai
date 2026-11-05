"use client";

import { useActionState } from "react";
import { AlertCircle, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormPendingOverlay } from "@/components/loading-overlay";
import { forgotPasswordAction, type ForgotPasswordState } from "./actions";

const initialState: ForgotPasswordState = {};

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState);

  if (state.success) {
    return (
      <p className="flex items-start gap-2 text-sm" role="status">
        <MailCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        Se o e-mail estiver cadastrado, enviamos um link para redefinir a senha. O link vale por 1 hora.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="h-11"
          required
          autoFocus
          placeholder="voce@igreja.com"
        />
      </div>
      {state.error && (
        <p className="flex items-center gap-2 text-sm text-destructive" role="alert">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {state.error}
        </p>
      )}
      <FormPendingOverlay message="Enviando..." />
      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? "Enviando..." : "Enviar link"}
      </Button>
    </form>
  );
}
