import { Card } from "../Card";

export function OverviewDetailSkeletons() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="w-full max-w-sm space-y-2">
              <div className="animate-shimmer h-4 w-36 rounded bg-[var(--surface-muted)]" />
              <div className="animate-shimmer h-3 w-full rounded bg-[var(--surface-muted)]" />
            </div>
            <div className="animate-shimmer h-9 w-9 rounded-lg bg-[var(--surface-muted)]" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-4"
              >
                <div className="animate-shimmer h-3 w-20 rounded bg-[var(--surface)]" />
                <div className="animate-shimmer mt-3 h-8 w-16 rounded bg-[var(--surface)]" />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="w-full max-w-44 space-y-2">
              <div className="animate-shimmer h-4 w-32 rounded bg-[var(--surface-muted)]" />
              <div className="animate-shimmer h-3 w-full rounded bg-[var(--surface-muted)]" />
            </div>
            <div className="animate-shimmer h-9 w-9 rounded-lg bg-[var(--surface-muted)]" />
          </div>

          <div className="flex h-32 items-end gap-2">
            {[38, 68, 48, 82, 60, 92, 54].map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="animate-shimmer w-full rounded-t-lg bg-[var(--surface-muted)]"
                  style={{ height: `${height}%` }}
                />
                <div className="animate-shimmer h-2 w-4 rounded bg-[var(--surface-muted)]" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, cardIndex) => (
          <Card key={cardIndex}>
            <div className="mb-4 flex items-center justify-between">
              <div className="w-full max-w-xs space-y-2">
                <div className="animate-shimmer h-4 w-36 rounded bg-[var(--surface-muted)]" />
                <div className="animate-shimmer h-3 w-full rounded bg-[var(--surface-muted)]" />
              </div>
              <div className="animate-shimmer h-9 w-9 rounded-lg bg-[var(--surface-muted)]" />
            </div>

            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className="flex items-center justify-between rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-3"
                >
                  <div className="flex items-center gap-3">
                    {cardIndex === 1 && (
                      <div className="animate-shimmer h-9 w-9 rounded-lg bg-[var(--surface)]" />
                    )}
                    <div className="space-y-2">
                      <div className="animate-shimmer h-3.5 w-36 rounded bg-[var(--surface)]" />
                      <div className="animate-shimmer h-3 w-20 rounded bg-[var(--surface)]" />
                    </div>
                  </div>
                  <div className="animate-shimmer h-7 w-16 rounded-full bg-[var(--surface)]" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
