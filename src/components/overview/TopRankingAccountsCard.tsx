import { Trophy } from "lucide-react";
import { Card } from "../Card";

export type OverviewRankingItem = {
  name: string;
  score: number;
  status: string;
};

type Props = {
  ranking: OverviewRankingItem[];
};

export function TopRankingAccountsCard({ ranking }: Props) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-[var(--text)]">
            Top Ranking Accounts
          </h2>
          <p className="text-xs text-[var(--text-subtle)]">
            Dummy ranking sementara.
          </p>
        </div>
        <Trophy size={18} className="text-[var(--warning)]" />
      </div>

      <div className="space-y-3">
        {ranking.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface)] text-sm font-bold text-[var(--warning)]">
                #{index + 1}
              </div>

              <div>
                <div className="text-sm font-medium text-[var(--text)]">
                  {item.name}
                </div>
                <div className="text-xs text-[var(--text-subtle)]">
                  {item.status}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-mono text-sm font-bold text-[var(--text)]">
                {item.score}
              </div>
              <div className="text-[10px] text-[var(--text-subtle)]">
                score
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
