"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToastActionState } from "@/hooks/use-toast-action-state";
import type { FormState } from "./actions";

interface PositionFormProps {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
}

const initialState: FormState = {};

export function PositionForm({ action }: PositionFormProps) {
  const [state, formAction, isPending] = useToastActionState(
    action,
    initialState,
    "Função criada com sucesso."
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex items-start gap-2">
      <div className="flex-1 space-y-1">
        <Input name="name" placeholder="Ex: Baixo, Guitarra, Foto..." required />
        {state.error && (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        )}
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Adicionando..." : "Adicionar"}
      </Button>
    </form>
  );
}
