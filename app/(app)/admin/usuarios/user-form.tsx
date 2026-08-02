"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormState } from "./actions";

interface UserFormProps {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  defaultValues?: { name: string; email: string };
  showPassword?: boolean;
  submitLabel?: string;
}

const initialState: FormState = {};

export function UserForm({
  action,
  defaultValues,
  showPassword = false,
  submitLabel = "Salvar",
}: UserFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

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
      {showPassword && (
        <div className="space-y-2">
          <Label htmlFor="password">Senha inicial</Label>
          <Input id="password" name="password" type="text" required minLength={8} />
        </div>
      )}
      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}
