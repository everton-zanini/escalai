"use client";

import { useLinkStatus } from "next/link";
import { createPortal, useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  show?: boolean;
  message?: string;
}

// Spans only, so it stays valid HTML when rendered inside <a>/<button>.
// The 150ms delay keeps fast transitions from flashing the modal.
export function LoadingOverlay({ show = true, message = "Carregando..." }: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <span
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm animate-in fade-in duration-200 delay-150 fill-mode-backwards"
    >
      <span className="flex items-center gap-3 rounded-2xl bg-card px-5 py-4 text-sm font-medium shadow-(--shadow-card) ring-1 ring-foreground/10">
        <Loader2 className="size-5 animate-spin text-primary" aria-hidden />
        {message}
      </span>
    </span>
  );
}

// Place inside a <form action={...}>: shows while the action is running.
export function FormPendingOverlay({ message = "Salvando..." }: { message?: string }) {
  const { pending } = useFormStatus();
  return <LoadingOverlay show={pending} message={message} />;
}

// Place inside a <Link>: shows while that navigation is pending.
// Rendered in a portal: the nav bars use backdrop-blur, which would otherwise
// trap a fixed overlay inside the bar.
export function LinkPendingOverlay({ message = "Carregando..." }: { message?: string }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return createPortal(<LoadingOverlay message={message} />, document.body);
}
