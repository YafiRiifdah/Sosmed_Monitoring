import { Activity, CheckCircle2, DownloadCloud, Percent, Play, RefreshCw, Users } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Skeleton } from "../components/Skeleton";
import { api } from "../services/api";
import { useAsync } from "../hooks/useAsync";

export function OverviewPage() {
  const { data, loading, error, reload } = useAsync(useCallback(() => api.overview(), []));
  const [jobMessage, setJobMessage] = useState<string | null>(null);
  const completionPercentage = data?.completionPercentage ?? 0;

  async function runJob(kind: "discover" | "engagement" | "score") {
    setJobMessage(null);
    if (kind === "discover") await api.discoverPosts();
    if (kind === "engagement") await api.fetchEngagements();
    if (kind === "score") await api.recalculateScore();
    setJobMessage("Job queued");
    await reload();
  }

  const cards = [
    { label: "Target Accounts", value: data?.totalTargetAccounts ?? 0, icon: <Users size={18} />, tone: "text-sky-400" },
    { label: "Posts", value: data?.totalPosts ?? 0, icon: <Activity size={18} />, tone: "text-blue-400" },
    { label: "Monitored", value: data?.totalMonitoredAccounts ?? 0, icon: <Users size={18} />, tone: "text-sky-400" },
    { label: "Complete", value: data?.totalCompletedEngagement ?? 0, icon: <CheckCircle2 size={18} />, tone: "text-emerald-400" },
    { label: "Incomplete", value: data?.totalIncompleteEngagement ?? 0, icon: <RefreshCw size={18} />, tone: "text-rose-400" },
    { label: "Completion", value: `${data?.completionPercentage ?? 0}%`, icon: <Percent size={18} />, tone: "text-sky-300" }
  ];

  return (
    <div className="space-y-5 text-[var(--text-muted)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text)] tracking-wide">Overview</h1>
          <p className="text-sm text-[var(--text-subtle)]">Data terkini dari Supabase PostgreSQL.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button icon={<DownloadCloud size={16} />} variant="ghost" onClick={() => void runJob("discover")}>Discover</Button>
          <Button icon={<Play size={16} />} variant="ghost" onClick={() => void runJob("engagement")}>Fetch</Button>
          <Button icon={<RefreshCw size={16} />} onClick={() => void runJob("score")}>Score</Button>
        </div>
      </div>

      {error && <div className="rounded-md border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</div>}
      {jobMessage && <div className="rounded-md border border-sky-500/20 bg-sky-500/10 p-3 text-sm text-sky-300">{jobMessage}</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <Skeleton variant="card" count={6} />
        ) : (
          cards.map((card) => (
            <Card key={card.label}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-[var(--text-subtle)]">{card.label}</div>
                  <div className="mt-2 text-3xl font-bold text-[var(--text)] tracking-tight">{card.value}</div>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-muted)] ${card.tone}`}>{card.icon}</div>
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
            <span className="font-semibold text-[var(--text-muted)]">Completion Percentage</span>
            <span className="font-bold text-sky-400 font-mono">{completionPercentage}%</span>
          </div>
          <div className="h-3.5 overflow-hidden rounded-full bg-[var(--surface-muted)] p-[1px] border border-[var(--border-soft)]">
            <div
              className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
