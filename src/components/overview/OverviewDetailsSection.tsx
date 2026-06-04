import { motion } from "framer-motion";
import { EngagementSummaryCard } from "./EngagementSummaryCard";
import { EngagementTrendCard } from "./EngagementTrendCard";
import { RecentActivitiesCard, type OverviewActivity } from "./RecentActivitiesCard";
import { TopRankingAccountsCard, type OverviewRankingItem } from "./TopRankingAccountsCard";

type Props = {
  completed: number;
  incomplete: number;
  pendingPercentage: number;
  trend: number[];
  activities: OverviewActivity[];
  ranking: OverviewRankingItem[];
};

export function OverviewDetailsSection({
  completed,
  incomplete,
  pendingPercentage,
  trend,
  activities,
  ranking,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="space-y-4"
    >
      <div className="grid gap-4 xl:grid-cols-3">
        <EngagementSummaryCard
          completed={completed}
          incomplete={incomplete}
          pendingPercentage={pendingPercentage}
        />
        <EngagementTrendCard trend={trend} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <RecentActivitiesCard activities={activities} />
        <TopRankingAccountsCard ranking={ranking} />
      </div>
    </motion.div>
  );
}
