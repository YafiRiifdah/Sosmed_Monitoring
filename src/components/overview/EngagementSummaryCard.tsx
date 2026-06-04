import { Percent } from "lucide-react";
import { Card } from "../Card";

type Props = {
  completed: number;
  incomplete: number;
  pendingPercentage: number;
};

export function EngagementSummaryCard({
  completed,
  incomplete,
  pendingPercentage,
}: Props) {
  return (
    <Card className="xl:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-[var(--text)]">
            Engagement Summary
          </h2>
          <p className="text-xs text-[var(--text-subtle)]">
            Ringkasan completion engagement berdasarkan data saat ini.
          </p>
        </div>
        <Percent size={18} className="text-[var(--warning)]" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-4">
          <div className="text-xs text-[var(--text-subtle)]">Completed</div>
          <div className="mt-2 text-2xl font-bold text-[var(--success)]">
            {completed}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-4">
          <div className="text-xs text-[var(--text-subtle)]">Incomplete</div>
          <div className="mt-2 text-2xl font-bold text-[var(--danger)]">
            {incomplete}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-4">
          <div className="text-xs text-[var(--text-subtle)]">Pending Ratio</div>
          <div className="mt-2 text-2xl font-bold text-[var(--text)]">
            {pendingPercentage}%
          </div>
        </div>
      </div>
    </Card>
  );
}
