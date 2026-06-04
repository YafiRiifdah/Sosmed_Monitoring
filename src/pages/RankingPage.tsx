import { Medal } from "lucide-react";
import { useCallback } from "react";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { useAsync } from "../hooks/useAsync";
import { api } from "../services/api";

export function RankingPage() {
  const { data, loading, error, reload } = useAsync(useCallback(() => api.ranking(), []));
  const rankingTableSkeleton = (
    <div className="overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--surface)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-[var(--border-soft)] bg-[var(--surface-muted)] text-xs uppercase text-[var(--text-subtle)]">
            <tr>
              <th className="px-4 py-3.5">Rank</th>
              <th className="px-4 py-3.5">Username</th>
              <th className="px-4 py-3.5">Likes</th>
              <th className="px-4 py-3.5">Comments</th>
              <th className="px-4 py-3.5">Score</th>
              <th className="px-4 py-3.5">Completion</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border-soft)]">
            {Array.from({ length: 8 }).map((_, index) => (
              <tr key={index}>
                <td className="px-4 py-3">
                  <div className="animate-shimmer h-8 w-8 rounded-lg bg-[var(--surface-muted)]" />
                </td>
                <td className="px-4 py-3">
                  <div className="animate-shimmer h-4 w-32 rounded bg-[var(--surface-muted)]" />
                </td>
                <td className="px-4 py-3">
                  <div className="animate-shimmer h-4 w-12 rounded bg-[var(--surface-muted)]" />
                </td>
                <td className="px-4 py-3">
                  <div className="animate-shimmer h-4 w-12 rounded bg-[var(--surface-muted)]" />
                </td>
                <td className="px-4 py-3">
                  <div className="animate-shimmer h-4 w-14 rounded bg-[var(--surface-muted)]" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="animate-shimmer h-2.5 w-28 rounded-full bg-[var(--surface-muted)]" />
                    <div className="animate-shimmer h-4 w-10 rounded bg-[var(--surface-muted)]" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 text-[var(--text-muted)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {loading ? (
          <div className="animate-shimmer h-8 w-32 rounded bg-[var(--surface-muted)]" />
        ) : (
          <h1 className="text-2xl font-semibold text-[var(--text)] tracking-wide">Ranking</h1>
        )}
        {loading ? (
          <div className="animate-shimmer h-10 w-24 rounded-md bg-[var(--surface-muted)]" />
        ) : (
          <Button onClick={() => void reload()} variant="ghost">Refresh</Button>
        )}
      </div>

      {error && <div className="rounded-md border border-[color-mix(in_srgb,var(--danger)_22%,transparent)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">{error}</div>}
      {loading ? rankingTableSkeleton : null}
      {!loading && (data ?? []).length === 0 ? <EmptyState message="Belum ada data ranking." /> : null}

      {!loading && (data ?? []).length > 0 && (
        <div className="overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--surface)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[var(--surface-muted)] text-xs uppercase text-[var(--text-subtle)] border-b border-[var(--border-soft)]">
                <tr>
                  <th className="px-4 py-3.5">Rank</th>
                  <th className="px-4 py-3.5">Username</th>
                  <th className="px-4 py-3.5">Likes</th>
                  <th className="px-4 py-3.5">Comments</th>
                  <th className="px-4 py-3.5">Score</th>
                  <th className="px-4 py-3.5">Completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-soft)]">
                {(data ?? []).map((row, index) => (
                  <tr key={row.id} className="hover:bg-[var(--surface-hover)] transition-all">
                    <td className="px-4 py-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-muted)] font-semibold text-[var(--text-muted)]">
                        {index < 3 ? (
                          <Medal 
                            size={16} 
                            className={
                              index === 0 
                                ? "text-[var(--warning)]" 
                                : index === 1 
                                ? "text-[var(--text-muted)]" 
                                : "text-[var(--warning)] opacity-80"
                            } 
                          />
                        ) : (
                          index + 1
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[var(--text)]">@{row.username}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{row.totalLikes}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{row.totalComments}</td>
                    <td className="px-4 py-3 font-bold text-[var(--warning)] font-mono">{row.totalScore}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-2.5 w-28 overflow-hidden rounded-full bg-[var(--surface-muted)] p-[1px] border border-[var(--border-soft)]">
                          <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${row.completionPercentage}%` }} />
                        </div>
                        <span className="font-semibold text-[var(--accent)] font-mono">{row.completionPercentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
