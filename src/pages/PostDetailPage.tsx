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
    <div className="space-y-5 text-[var(--text-muted)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button icon={<ArrowLeft size={16} />} variant="ghost" onClick={onBack}>Back</Button>
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text)] tracking-wide">@{post.targetAccount.username}</h1>
            <p className="text-sm text-[var(--text-subtle)] font-mono">{post.instagramPostId}</p>
          </div>
        </div>
        <Button onClick={() => void reload()} variant="ghost">Refresh</Button>
      </div>

      {error && <div className="rounded-md border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</div>}
      {loading ? <div className="text-sm text-[var(--text-subtle)] animate-pulse">Loading post detail...</div> : null}

      {!loading && (
        <div className="overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--surface)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-[var(--surface-muted)] text-xs uppercase text-[var(--text-subtle)] border-b border-[var(--border-soft)]">
                <tr>
                  <th className="px-4 py-3.5">Username</th>
                  <th className="px-4 py-3.5">Liked</th>
                  <th className="px-4 py-3.5">Commented</th>
                  <th className="px-4 py-3.5">Score</th>
                  <th className="px-4 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-soft)]">
                {(data?.statuses ?? []).map((row) => (
                  <tr key={row.id} className="hover:bg-[var(--surface-hover)] transition-all">
                    <td className="px-4 py-3 font-semibold text-[var(--text)]">@{row.username}</td>
                    <td className="px-4 py-3">
                      {row.liked ? <Check className="text-sky-400" size={18} /> : <X className="text-rose-400" size={18} />}
                    </td>
                    <td className="px-4 py-3">
                      {row.commented ? <Check className="text-sky-400" size={18} /> : <X className="text-rose-400" size={18} />}
                    </td>
                    <td className="px-4 py-3 font-bold text-sky-400 font-mono">{row.score}</td>
                    <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
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
