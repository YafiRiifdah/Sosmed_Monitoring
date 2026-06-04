import {
  Activity,
  CheckCircle2,
  Percent,
  RefreshCw,
  Users,
} from "lucide-react";
import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { CompletionProgressCard } from "../components/overview/CompletionProgressCard";
import { OverviewAlerts } from "../components/overview/OverviewAlerts";
import { OverviewDetailSkeletons } from "../components/overview/OverviewDetailSkeletons";
import { OverviewDetailsSection } from "../components/overview/OverviewDetailsSection";
import { OverviewHeader } from "../components/overview/OverviewHeader";
import { OverviewStatsGrid, type OverviewStatCard } from "../components/overview/OverviewStatsGrid";
import { overviewActivities, overviewRanking } from "../components/overview/overviewDemoData";
import { api } from "../services/api";
import { useAsync } from "../hooks/useAsync";

export function OverviewPage() {
  const { data, loading, error, reload } = useAsync(
    useCallback(() => api.overview(), [])
  );

  const [jobMessage, setJobMessage] = useState<string | null>(null);
  const completionPercentage = data?.completionPercentage ?? 0;
  const pendingPercentage = Math.max(0, 100 - completionPercentage);
  const trend = [18, 28, 22, 40, 35, 58, completionPercentage || 11];

  async function runJob(kind: "discover" | "engagement" | "score") {
    setJobMessage(null);
    if (kind === "discover") await api.discoverPosts();
    if (kind === "engagement") await api.fetchEngagements();
    if (kind === "score") await api.recalculateScore();
    setJobMessage("Job queued");
    await reload();
  }

  const cards: OverviewStatCard[] = [
    {
      label: "Target Accounts",
      value: data?.totalTargetAccounts ?? 0,
      icon: <Users size={18} />,
      tone: "text-[var(--accent)]",
    },
    {
      label: "Posts",
      value: data?.totalPosts ?? 0,
      icon: <Activity size={18} />,
      tone: "text-[var(--info)]",
    },
    {
      label: "Monitored",
      value: data?.totalMonitoredAccounts ?? 0,
      icon: <Users size={18} />,
      tone: "text-[var(--success)]",
    },
    {
      label: "Complete",
      value: data?.totalCompletedEngagement ?? 0,
      icon: <CheckCircle2 size={18} />,
      tone: "text-[var(--success)]",
    },
    {
      label: "Incomplete",
      value: data?.totalIncompleteEngagement ?? 0,
      icon: <RefreshCw size={18} />,
      tone: "text-[var(--danger)]",
    },
    {
      label: "Completion",
      value: `${data?.completionPercentage ?? 0}%`,
      icon: <Percent size={18} />,
      tone: "text-[var(--warning)]",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-5 text-[var(--text-muted)]"
    >
      <OverviewHeader onRunJob={(kind) => void runJob(kind)} />
      <OverviewAlerts error={error} jobMessage={jobMessage} />
      <OverviewStatsGrid cards={cards} loading={loading} />
      <CompletionProgressCard
        completionPercentage={completionPercentage}
        loading={loading}
      />

      {loading ? (
        <OverviewDetailSkeletons />
      ) : (
        <OverviewDetailsSection
          completed={data?.totalCompletedEngagement ?? 0}
          incomplete={data?.totalIncompleteEngagement ?? 0}
          pendingPercentage={pendingPercentage}
          trend={trend}
          activities={overviewActivities}
          ranking={overviewRanking}
        />
      )}
    </motion.div>
  );
}
