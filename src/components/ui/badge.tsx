import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export const badgeVariants = cva("inline-flex min-w-24 justify-center rounded-md border px-2 py-1 text-xs font-semibold backdrop-blur-md transition-colors", {
  variants: {
    tone: {
      complete: "border-[color-mix(in_srgb,var(--success)_25%,transparent)] bg-[var(--success-soft)] text-[var(--success)]",
      likeOnly: "border-[var(--accent-ring)] bg-[var(--accent-soft)] text-[var(--accent)]",
      commentOnly: "border-[color-mix(in_srgb,var(--info)_25%,transparent)] bg-[var(--info-soft)] text-[var(--info)]",
      likeUnavailable: "border-[var(--border-soft)] bg-[var(--surface-muted)] text-[var(--text-muted)]",
      missing: "border-[color-mix(in_srgb,var(--danger)_25%,transparent)] bg-[var(--danger-soft)] text-[var(--danger)]"
    }
  },
  defaultVariants: {
    tone: "missing"
  }
});

export type UiBadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function UiBadge({ className, tone, ...props }: UiBadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
