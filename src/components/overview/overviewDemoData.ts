import type { OverviewActivity } from "./RecentActivitiesCard";
import type { OverviewRankingItem } from "./TopRankingAccountsCard";

export const overviewActivities: OverviewActivity[] = [
  {
    title: "Discover posts job queued",
    time: "Just now",
    status: "System",
  },
  {
    title: "Engagement data fetched",
    time: "2 minutes ago",
    status: "Fetch",
  },
  {
    title: "Score recalculation completed",
    time: "5 minutes ago",
    status: "Score",
  },
  {
    title: "Monitoring data synced from Supabase",
    time: "10 minutes ago",
    status: "Sync",
  },
];

export const overviewRanking: OverviewRankingItem[] = [
  {
    name: "@user_alpha",
    score: 92,
    status: "Complete",
  },
  {
    name: "@user_beta",
    score: 78,
    status: "Good",
  },
  {
    name: "@user_gamma",
    score: 41,
    status: "Pending",
  },
];
