import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export const badgeVariants = cva("inline-flex min-w-24 justify-center rounded-md border px-2 py-1 text-xs font-semibold backdrop-blur-md transition-colors", {
  variants: {
    tone: {
      complete: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
      likeOnly: "border-teal-500/25 bg-teal-500/10 text-teal-400",
      commentOnly: "border-indigo-500/25 bg-indigo-500/10 text-indigo-400",
      likeUnavailable: "border-slate-500/20 bg-slate-500/10 text-slate-400",
      missing: "border-rose-500/25 bg-rose-500/10 text-rose-400"
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
