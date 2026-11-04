"use client";

import { Button } from "@/components/ui/button";
import { FormPendingOverlay } from "@/components/loading-overlay";
import { useToastActionState } from "@/hooks/use-toast-action-state";
import type { FormState } from "../actions";
import { addMembershipAction } from "../actions";

interface AddMemberFormProps {
  departmentId: number;
  availableUsers: { id: number; name: string; email: string }[];
}

const initialState: FormState = {};

export function AddMemberForm({ departmentId, availableUsers }: AddMemberFormProps) {
  const [state, formAction, isPending] = useToastActionState(
    addMembershipAction,
    initialState,
    "Membro adicionado ao departamento."
  );

  if (availableUsers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todos os membros ativos já fazem parte deste departamento.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
      <input type="hidden" name="departmentId" value={departmentId} />
      <select
        name="userId"
        required
        className="h-9 flex-1 rounded-lg border border-input bg-transparent px-2.5 text-sm"
      >
        {availableUsers.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name} ({user.email})
          </option>
        ))}
      </select>
      <select
        name="role"
        required
        defaultValue="MEMBRO"
        className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm"
      >
        <option value="MEMBRO">Membro</option>
        <option value="LIDER">Líder</option>
      </select>
      <FormPendingOverlay message="Adicionando..." />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Adicionando..." : "Adicionar"}
      </Button>
      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
