"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormPendingOverlay } from "@/components/loading-overlay";
import { resetChurchAdminPasswordAction, type ResetPasswordState } from "../../actions";

const initialState: ResetPasswordState = {};

export function ResetAdminPasswordForm({ userId }: { userId: number }) {
  const [state, formAction, isPending] = useActionState(
    resetChurchAdminPasswordAction,
    initialState
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
    else if (state.tempPassword) toast.success("Senha redefinida com sucesso.");
  }, [state]);

  return (
    <div className="space-y-2">
      <form action={formAction}>
        <input type="hidden" name="userId" value={userId} />
        <FormPendingOverlay message="Gerando senha..." />
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          {isPending ? "Gerando..." : "Redefinir senha"}
        </Button>
      </form>
      {state.tempPassword && (
        <p className="rounded-lg border bg-muted p-2 text-sm">
          Senha temporária: <strong className="font-mono">{state.tempPassword}</strong>
          <span className="block text-muted-foreground">
            Não será mostrada novamente. A pessoa deverá trocá-la no próximo login.
          </span>
        </p>
      )}
    </div>
  );
}
