"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resetPasswordAction, type ResetPasswordState } from "../actions";

interface ResetPasswordFormProps {
  userId: number;
}

const initialState: ResetPasswordState = {};

export function ResetPasswordForm({ userId }: ResetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);

  useEffect(() => {
    if (state.error) toast.error(state.error);
    else if (state.tempPassword) toast.success("Senha redefinida com sucesso.");
  }, [state]);

  return (
    <div className="space-y-3">
      <form action={formAction}>
        <input type="hidden" name="userId" value={userId} />
        <Button type="submit" variant="outline" disabled={isPending}>
          {isPending ? "Gerando..." : "Redefinir senha"}
        </Button>
      </form>

      {state.tempPassword && (
        <div className="rounded-lg border bg-muted p-3 text-sm">
          <p>
            Nova senha temporária: <strong className="font-mono">{state.tempPassword}</strong>
          </p>
          <p className="mt-1 text-muted-foreground">
            Repasse essa senha à pessoa. No próximo login ela será obrigada a trocá-la.
            Esta senha não será mostrada novamente.
          </p>
        </div>
      )}
    </div>
  );
}
