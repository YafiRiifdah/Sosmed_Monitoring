import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export const UiCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-[var(--card-shadow)] backdrop-blur-xl transition-all duration-300",
      className
    )}
    {...props}
  />
));

UiCard.displayName = "UiCard";
