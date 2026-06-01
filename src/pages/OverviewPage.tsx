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

  async function runJob(kind: "discover" | "engagement" | "score") {
    setJobMessage(null);
    if (kind === "discover") await api.discoverPosts();
    if (kind === "engagement") await api.fetchEngagements();
    if (kind === "score") await api.recalculateScore();
    setJobMessage("Job queued");
    await reload();
  }

  const cards = [
    { label: "Target Accounts", value: data?.totalTargetAccounts ?? 0, icon: <Users size={18} />, tone: "text-teal-700" },
    { label: "Posts", value: data?.totalPosts ?? 0, icon: <Activity size={18} />, tone: "text-coral" },
    { label: "Monitored", value: data?.totalMonitoredAccounts ?? 0, icon: <Users size={18} />, tone: "text-amber-700" },
    { label: "Complete", value: data?.totalCompletedEngagement ?? 0, icon: <CheckCircle2 size={18} />, tone: "text-teal-700" },
    { label: "Incomplete", value: data?.totalIncompleteEngagement ?? 0, icon: <RefreshCw size={18} />, tone: "text-coral" },
    { label: "Completion", value: `${data?.completionPercentage ?? 0}%`, icon: <Percent size={18} />, tone: "text-ink" }
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <p className="text-sm text-slate-500">Last data from Supabase PostgreSQL.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button icon={<DownloadCloud size={16} />} variant="ghost" onClick={() => void runJob("discover")}>Discover</Button>
          <Button icon={<Play size={16} />} variant="ghost" onClick={() => void runJob("engagement")}>Fetch</Button>
          <Button icon={<RefreshCw size={16} />} onClick={() => void runJob("score")}>Score</Button>
        </div>
      </div>

      {error && <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      {jobMessage && <div className="rounded-md border border-teal-200 bg-teal-50 p-3 text-sm text-teal-700">{jobMessage}</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <Skeleton variant="card" count={6} />
        ) : (
          cards.map((card) => (
            <Card key={card.label}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">{card.label}</div>
                  <div className="mt-2 text-3xl font-semibold">{card.value}</div>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-md bg-mist ${card.tone}`}>{card.icon}</div>
              </div>
            </Card>
          ))
        )}
      </div>

      {loading ? (
        <Card className="animate-shimmer min-h-[56px] border-slate-100">
          <div className="opacity-0 space-y-2">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-3 w-full bg-slate-200 rounded" />
          </div>
        </Card>
      ) : (
        <Card>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">Completion percentage</span>
            <span>{data?.completionPercentage ?? 0}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-md bg-slate-200">
            <div className="h-full bg-teal-600 transition-all" style={{ width: `${data?.completionPercentage ?? 0}%` }} />
          </div>
        </Card>
      )}
    </div>
  );
}

