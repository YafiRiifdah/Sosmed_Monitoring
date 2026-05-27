import { Medal } from "lucide-react";
import { useCallback } from "react";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { useAsync } from "../hooks/useAsync";
import { api } from "../services/api";

export function RankingPage() {
  const { data, loading, error, reload } = useAsync(useCallback(() => api.ranking(), []));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Ranking</h1>
        <Button onClick={() => void reload()} variant="ghost">Refresh</Button>
      </div>
      {error && <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      {loading ? <div className="text-sm text-slate-500">Loading...</div> : null}
      {!loading && (data ?? []).length === 0 ? <EmptyState message="No ranking data yet." /> : null}
      <div className="overflow-hidden rounded-md border border-line bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-mist text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Likes</th>
              <th className="px-4 py-3">Comments</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Completion</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row, index) => (
              <tr key={row.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-mist font-semibold">
                    {index < 3 ? <Medal size={16} className={index === 0 ? "text-amber-700" : "text-slate-500"} /> : index + 1}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">@{row.username}</td>
                <td className="px-4 py-3">{row.totalLikes}</td>
                <td className="px-4 py-3">{row.totalComments}</td>
                <td className="px-4 py-3 font-semibold">{row.totalScore}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-28 overflow-hidden rounded-md bg-slate-200">
                      <div className="h-full bg-teal-600" style={{ width: `${row.completionPercentage}%` }} />
                    </div>
                    <span>{row.completionPercentage}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
