import { ArrowLeft, Check, X } from "lucide-react";
import { useCallback } from "react";
import { Button } from "../components/Button";
import { StatusBadge } from "../components/StatusBadge";
import { useAsync } from "../hooks/useAsync";
import { api } from "../services/api";
import type { PostSummary } from "../types";

export function PostDetailPage({ post, onBack }: { post: PostSummary; onBack: () => void }) {
  const { data, loading, error, reload } = useAsync(useCallback(() => api.postStatus(post.id), [post.id]));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button icon={<ArrowLeft size={16} />} variant="ghost" onClick={onBack}>Back</Button>
          <div>
            <h1 className="text-2xl font-semibold">@{post.targetAccount.username}</h1>
            <p className="text-sm text-slate-500">{post.instagramPostId}</p>
          </div>
        </div>
        <Button onClick={() => void reload()} variant="ghost">Refresh</Button>
      </div>
      {error && <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      {loading ? <div className="text-sm text-slate-500">Loading...</div> : null}
      <div className="overflow-hidden rounded-md border border-line bg-white">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-mist text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Liked</th>
              <th className="px-4 py-3">Commented</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data?.statuses ?? []).map((row) => (
              <tr key={row.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium">@{row.username}</td>
                <td className="px-4 py-3">{row.liked ? <Check className="text-teal-700" size={18} /> : <X className="text-coral" size={18} />}</td>
                <td className="px-4 py-3">{row.commented ? <Check className="text-teal-700" size={18} /> : <X className="text-coral" size={18} />}</td>
                <td className="px-4 py-3 font-semibold">{row.score}</td>
                <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
