import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export const buttonVariants = cva(
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "bg-[image:var(--primary-gradient)] text-[var(--accent-contrast)] font-bold hover:opacity-95",
        ghost: "border border-[var(--border-soft)] bg-[var(--surface-muted)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] hover:border-[var(--border)]",
        danger: "bg-[var(--danger-soft)] text-[var(--danger)] border border-[color-mix(in_srgb,var(--danger)_22%,transparent)] hover:bg-[color-mix(in_srgb,var(--danger-soft)_70%,var(--surface-hover))]"
      }
    },
    defaultVariants: {
      variant: "primary"
    }
  }
);

export type UiButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export const UiButton = forwardRef<HTMLButtonElement, UiButtonProps>(({ className, variant, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant }), className)} {...props} />
));

UiButton.displayName = "UiButton";
