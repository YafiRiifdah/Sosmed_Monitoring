import { motion } from "framer-motion";
import { Card } from "../Card";

type Props = {
  completionPercentage: number;
  loading: boolean;
};

export function CompletionProgressCard({ completionPercentage, loading }: Props) {
  if (loading) {
    return (
      <Card className="animate-shimmer min-h-[56px] border-[var(--border-soft)]">
        <div className="opacity-0 space-y-2">
          <div className="h-4 w-24 bg-[var(--surface-muted)] rounded" />
          <div className="h-3 w-full bg-[var(--surface-muted)] rounded" />
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card>
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-semibold text-[var(--text-muted)]">
            Completion Percentage
          </span>
          <span className="font-bold text-[var(--accent)] font-mono">
            {completionPercentage}%
          </span>
        </div>

        <div className="h-3.5 overflow-hidden rounded-full bg-[var(--surface-muted)] p-[1px] border border-[var(--border-soft)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="h-full bg-[var(--accent)] rounded-full"
          />
        </div>
      </Card>
    </motion.div>
  );
}
