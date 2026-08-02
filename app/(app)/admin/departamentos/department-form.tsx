"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEPARTMENT_COLORS } from "@/lib/department-colors";
import type { FormState } from "./actions";

interface DepartmentFormProps {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  defaultValues?: { name: string; description: string | null };
  showColorPicker?: boolean;
  submitLabel?: string;
}

const initialState: FormState = {};

export function DepartmentForm({
  action,
  defaultValues,
  showColorPicker = false,
  submitLabel = "Salvar",
}: DepartmentFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" required defaultValue={defaultValues?.name} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Input
          id="description"
          name="description"
          defaultValue={defaultValues?.description ?? ""}
        />
      </div>
      {showColorPicker && (
        <div className="space-y-2">
          <Label>Cor</Label>
          <div className="flex flex-wrap gap-2">
            {DEPARTMENT_COLORS.map((color, index) => (
              <label key={color} className="cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value={color}
                  defaultChecked={index === 0}
                  className="peer sr-only"
                />
                <span
                  className="block size-7 rounded-full ring-offset-2 peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
                  style={{ backgroundColor: color }}
                />
              </label>
            ))}
          </div>
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
