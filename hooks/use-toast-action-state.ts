"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

export function useToastActionState<State extends { error?: string; success?: boolean }>(
  action: (state: State, formData: FormData) => Promise<State>,
  initialState: State,
  successMessage: string
) {
  const [state, formAction, isPending] = useActionState<State, FormData>(
    action,
    initialState as Awaited<State>
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
    else if (state.success) toast.success(successMessage);
  }, [state, successMessage]);

  return [state, formAction, isPending] as const;
}
