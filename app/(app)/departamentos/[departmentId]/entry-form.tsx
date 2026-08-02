"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormState } from "./actions";

interface EntryFormProps {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  members: { id: number; name: string }[];
  positions: { id: number; name: string }[];
  defaultValues?: {
    date: string;
    title: string;
    note: string;
    assignments: { userId: number; positionId: number | null }[];
  };
  submitLabel?: string;
}

const initialState: FormState = {};

export function EntryForm({
  action,
  members,
  positions,
  defaultValues,
  submitLabel = "Salvar escala",
}: EntryFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const assignedMap = new Map(
    (defaultValues?.assignments ?? []).map((a) => [a.userId, a.positionId])
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Data</Label>
        <Input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={defaultValues?.date}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Título (opcional)</Label>
        <Input
          id="title"
          name="title"
          placeholder="Ex: Culto de domingo"
          defaultValue={defaultValues?.title}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="note">Observação (opcional)</Label>
        <Input id="note" name="note" defaultValue={defaultValues?.note} />
      </div>

      <div className="space-y-2">
        <Label>Quem vai trabalhar</Label>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Este departamento ainda não tem membros.
          </p>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border p-3">
            {members.map((member) => {
              const currentPositionId = assignedMap.get(member.id) ?? null;
              return (
                <div key={member.id} className="flex items-center gap-2 text-sm">
                  <label className="flex flex-1 items-center gap-2">
                    <input
                      type="checkbox"
                      name={`assignee-${member.id}`}
                      defaultChecked={assignedMap.has(member.id)}
                      className="size-4 rounded border-input"
                    />
                    {member.name}
                  </label>
                  {positions.length > 0 && (
                    <select
                      name={`position-${member.id}`}
                      defaultValue={currentPositionId ?? ""}
                      className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
                    >
                      <option value="">Sem função</option>
                      {positions.map((position) => (
                        <option key={position.id} value={position.id}>
                          {position.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}
