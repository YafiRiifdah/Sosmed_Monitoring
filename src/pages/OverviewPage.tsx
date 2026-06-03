import {
  Activity,
  CheckCircle2,
  Clock,
  DownloadCloud,
  Percent,
  Play,
  RefreshCw,
  Trophy,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Skeleton } from "../components/Skeleton";
import { api } from "../services/api";
import { useAsync } from "../hooks/useAsync";

export function OverviewPage() {
  const { data, loading, error, reload } = useAsync(
    useCallback(() => api.overview(), [])
  );

  const [jobMessage, setJobMessage] = useState<string | null>(null);
  const completionPercentage = data?.completionPercentage ?? 0;
  const pendingPercentage = Math.max(0, 100 - completionPercentage);

  async function runJob(kind: "discover" | "engagement" | "score") {
    setJobMessage(null);
    if (kind === "discover") await api.discoverPosts();
    if (kind === "engagement") await api.fetchEngagements();
    if (kind === "score") await api.recalculateScore();
    setJobMessage("Job queued");
    await reload();
  }

  const cards = [
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

  const dummyTrend = [18, 28, 22, 40, 35, 58, completionPercentage || 11];

  const dummyActivities = [
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

  const dummyRanking = [
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

  return (
    <div className="space-y-5 text-[var(--text-muted)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text)] tracking-wide">
            Overview
          </h1>
          <p className="text-sm text-[var(--text-subtle)]">
            Data terkini dari Supabase PostgreSQL.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            icon={<DownloadCloud size={16} />}
            variant="ghost"
            onClick={() => void runJob("discover")}
          >
            Discover
          </Button>

          <Button
            icon={<Play size={16} />}
            variant="ghost"
            onClick={() => void runJob("engagement")}
          >
            Fetch
          </Button>

          <Button
            icon={<RefreshCw size={16} />}
            onClick={() => void runJob("score")}
          >
            Score
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-[color-mix(in_srgb,var(--danger)_22%,transparent)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      {jobMessage && (
        <div className="rounded-md border border-[var(--accent-ring)] bg-[var(--accent-soft)] p-3 text-sm text-[var(--accent)]">
          {jobMessage}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <Skeleton variant="card" count={6} />
        ) : (
          cards.map((card) => (
            <Card key={card.label}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-[var(--text-subtle)]">
                    {card.label}
                  </div>
                  <div className="mt-2 text-3xl font-bold text-[var(--text)] tracking-tight">
                    {card.value}
                  </div>
                </div>

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-muted)] ${card.tone}`}
                >
                  {card.icon}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {loading ? (
        <Card className="animate-shimmer min-h-[56px] border-[var(--border-soft)]">
          <div className="opacity-0 space-y-2">
            <div className="h-4 w-24 bg-[var(--surface-muted)] rounded" />
            <div className="h-3 w-full bg-[var(--surface-muted)] rounded" />
          </div>
        </Card>
      ) : (
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
            <div
              className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </Card>
      )}

      {!loading && (
        <>
          <div className="grid gap-4 xl:grid-cols-3">
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
                  <div className="text-xs text-[var(--text-subtle)]">
                    Completed
                  </div>
                  <div className="mt-2 text-2xl font-bold text-[var(--success)]">
                    {data?.totalCompletedEngagement ?? 0}
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-4">
                  <div className="text-xs text-[var(--text-subtle)]">
                    Incomplete
                  </div>
                  <div className="mt-2 text-2xl font-bold text-[var(--danger)]">
                    {data?.totalIncompleteEngagement ?? 0}
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-4">
                  <div className="text-xs text-[var(--text-subtle)]">
                    Pending Ratio
                  </div>
                  <div className="mt-2 text-2xl font-bold text-[var(--text)]">
                    {pendingPercentage}%
                  </div>
                </div>
              </div>
            </Card>

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
                {dummyTrend.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div
                      className="w-full rounded-t-lg bg-[var(--accent)] opacity-75 transition-all hover:opacity-100"
                      style={{ height: `${Math.max(item, 8)}%` }}
                    />
                    <span className="text-[10px] text-[var(--text-subtle)]">
                      D{index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-[var(--text)]">
                    Recent Activities
                  </h2>
                  <p className="text-xs text-[var(--text-subtle)]">
                    Dummy log sementara sebelum fetching manual.
                  </p>
                </div>

                <Clock size={18} className="text-[var(--accent)]" />
              </div>

              <div className="space-y-3">
                {dummyActivities.map((activity) => (
                  <div
                    key={activity.title}
                    className="flex items-center justify-between rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-3"
                  >
                    <div>
                      <div className="text-sm font-medium text-[var(--text)]">
                        {activity.title}
                      </div>
                      <div className="text-xs text-[var(--text-subtle)]">
                        {activity.time}
                      </div>
                    </div>

                    <span className="rounded-full border border-[var(--accent-ring)] bg-[var(--accent-soft)] px-2.5 py-1 text-xs text-[var(--accent)]">
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

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
                {dummyRanking.map((item, index) => (
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
          </div>
        </>
      )}
    </div>
  );
}
