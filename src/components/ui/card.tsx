import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export const UiCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-2xl backdrop-blur-xl transition-colors", className)} {...props} />
));

UiCard.displayName = "UiCard";
