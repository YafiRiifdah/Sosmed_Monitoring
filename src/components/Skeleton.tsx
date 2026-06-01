import { Card } from "./Card";

type SkeletonProps = {
  variant?: "card" | "row" | "circle" | "text";
  count?: number;
  className?: string;
};

export function Skeleton({ variant = "text", count = 1, className = "" }: SkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === "card") {
    return (
      <>
        {items.map((_, i) => (
          <Card key={i} className={`animate-shimmer min-h-[96px] border-slate-100 ${className}`}>
            <div className="space-y-3 opacity-0">
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-8 w-16 bg-slate-200 rounded" />
            </div>
          </Card>
        ))}
      </>
    );
  }

  if (variant === "row") {
    return (
      <div className="space-y-3">
        {items.map((_, i) => (
          <div key={i} className={`animate-shimmer h-12 w-full rounded-md border border-slate-100 ${className}`} />
        ))}
      </div>
    );
  }

  if (variant === "circle") {
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((_, i) => (
          <div key={i} className={`animate-shimmer h-10 w-10 rounded-full ${className}`} />
        ))}
      </div>
    );
  }

  // Default: text line
  return (
    <div className="space-y-2.5">
      {items.map((_, i) => (
        <div key={i} className={`animate-shimmer h-3.5 w-full rounded bg-slate-200 ${className}`} />
      ))}
    </div>
  );
}
