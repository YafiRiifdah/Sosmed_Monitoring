import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "../Card";

type Props = {
  trend: number[];
};

export function EngagementTrendCard({ trend }: Props) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-[var(--text)]">
            Engagement Trend
          </h2>
          <p className="text-xs text-[var(--text-subtle)]">
            Dummy 7 hari terakhir.
          </p>
        </div>
        <TrendingUp size={18} className="text-[var(--success)]" />
      </div>

      <div className="flex h-32 items-end gap-2">
        {trend.map((item, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full h-full flex items-end justify-center">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(item, 8)}%` }}
                transition={{ duration: 0.6, delay: index * 0.05, ease: "easeOut" }}
                className="w-full rounded-t-lg bg-[var(--accent)] opacity-75 transition-all hover:opacity-100"
              />
            </div>
            <span className="text-[10px] text-[var(--text-subtle)]">
              D{index + 1}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
