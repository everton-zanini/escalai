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
    time: string;
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
  const assignedPositionsByUser = new Map<number, Set<number | null>>();
  for (const a of defaultValues?.assignments ?? []) {
    const set = assignedPositionsByUser.get(a.userId) ?? new Set<number | null>();
    set.add(a.positionId);
    assignedPositionsByUser.set(a.userId, set);
  }

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
        <Label htmlFor="time">Horário (opcional)</Label>
        <Input
          id="time"
          name="time"
          type="time"
          defaultValue={defaultValues?.time}
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
              const memberPositions = assignedPositionsByUser.get(member.id);
              return (
                <div key={member.id} className="space-y-1 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name={`assignee-${member.id}`}
                      defaultChecked={memberPositions !== undefined}
                      className="size-4 rounded border-input"
                    />
                    {member.name}
                  </label>
                  {positions.length > 0 && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1 pl-6">
                      {positions.map((position) => (
                        <label key={position.id} className="flex items-center gap-1 text-xs text-muted-foreground">
                          <input
                            type="checkbox"
                            name={`position-${member.id}-${position.id}`}
                            defaultChecked={memberPositions?.has(position.id) ?? false}
                            className="size-3.5 rounded border-input"
                          />
                          {position.name}
                        </label>
                      ))}
                    </div>
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
