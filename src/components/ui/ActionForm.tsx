"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { FormState } from "@/lib/types";
import { cn } from "@/lib/utils";

const ErrorsContext = createContext<FormState["errors"]>({});

/** Wraps a server action: shows success/error toasts and exposes field errors to <FieldError />. */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction] = useFormState(action, {} as FormState);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) {
      toast.success(state.message);
      if (resetOnSuccess) ref.current?.reset();
    } else toast.error(state.message);
  }, [state, resetOnSuccess]);

  return (
    <ErrorsContext.Provider value={state.errors}>
      <form ref={ref} action={formAction} className={className} noValidate>
        {children}
      </form>
    </ErrorsContext.Provider>
  );
}

export function FieldError({ name }: { name: string }) {
  const errors = useContext(ErrorsContext);
  const msg = errors?.[name]?.[0];
  if (!msg) return null;
  return <p role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">{msg}</p>;
}

export function SubmitButton({ children, className, variant = "primary" }: { children: React.ReactNode; className?: string; variant?: "primary" | "outline" | "danger" }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn(variant === "primary" ? "btn-primary" : variant === "danger" ? "btn-danger" : "btn-outline", className)}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
