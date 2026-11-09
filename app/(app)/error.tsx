"use client";

import { useEffect } from "react";
import { RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 p-8 text-center">
      <WifiOff className="size-10 text-muted-foreground" aria-hidden />
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Não foi possível carregar</h1>
        <p className="text-sm text-muted-foreground">
          Pode ser a conexão ou uma instabilidade do servidor. Tente de novo em instantes.
        </p>
      </div>
      <Button onClick={reset}>
        <RefreshCw className="size-4" />
        Tentar de novo
      </Button>
    </div>
  );
}
