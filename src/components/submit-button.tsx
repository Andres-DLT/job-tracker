"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  pendingText,
  className,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn("btn btn-primary", className)}>
      {pending && (
        <span className="size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
      )}
      {pending ? (pendingText ?? children) : children}
    </button>
  );
}
