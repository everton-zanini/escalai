"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormPendingOverlay } from "@/components/loading-overlay";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormState } from "@/app/(app)/indisponibilidades/actions";

interface AvailabilityRequestFormProps {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  departments: { id: number; name: string }[];
}

const initialState: FormState = {};

export function AvailabilityRequestForm({ action, departments }: AvailabilityRequestFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const checked = formRef.current?.querySelectorAll('input[name="departmentIds"]:checked');
    if (!checked || checked.length === 0) {
      event.preventDefault();
      toast.error("Selecione ao menos um departamento.");
    }
  }

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Departamentos</Label>
        <div className="space-y-2 rounded-lg border p-3">
          {departments.map((department) => (
            <label key={department.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="departmentIds"
                value={department.id}
                defaultChecked={departments.length === 1}
                className="size-4 rounded border-input"
              />
              {department.name}
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Data</Label>
        <Input id="date" name="date" type="date" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reason">Motivo</Label>
        <Input id="reason" name="reason" placeholder="Ex: Viagem em família" required />
      </div>

      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <FormPendingOverlay message="Enviando..." />
      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? "Enviando..." : "Enviar solicitação"}
      </Button>
    </form>
  );
}
