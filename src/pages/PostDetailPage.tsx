import { ArrowLeft, Check, X } from "lucide-react";
import { useCallback } from "react";
import { Button } from "../components/Button";
import { StatusBadge } from "../components/StatusBadge";
import { useAsync } from "../hooks/useAsync";
import { api } from "../services/api";
import type { PostSummary } from "../types";

export function PostDetailPage({ post, onBack }: { post: PostSummary; onBack: () => void }) {
  const { data, loading, error, reload } = useAsync(useCallback(() => api.postStatus(post.id), [post.id]));
  const statusTableSkeleton = (
    <div className="overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--surface)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-[var(--border-soft)] bg-[var(--surface-muted)] text-xs uppercase text-[var(--text-subtle)]">
            <tr>
              <th className="px-4 py-3.5">Username</th>
              <th className="px-4 py-3.5">Liked</th>
              <th className="px-4 py-3.5">Commented</th>
              <th className="px-4 py-3.5">Score</th>
              <th className="px-4 py-3.5">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border-soft)]">
            {Array.from({ length: 7 }).map((_, index) => (
              <tr key={index}>
                <td className="px-4 py-3">
                  <div className="animate-shimmer h-4 w-32 rounded bg-[var(--surface-muted)]" />
                </td>
                <td className="px-4 py-3">
                  <div className="animate-shimmer h-5 w-5 rounded bg-[var(--surface-muted)]" />
                </td>
                <td className="px-4 py-3">
                  <div className="animate-shimmer h-5 w-5 rounded bg-[var(--surface-muted)]" />
                </td>
                <td className="px-4 py-3">
                  <div className="animate-shimmer h-4 w-10 rounded bg-[var(--surface-muted)]" />
                </td>
                <td className="px-4 py-3">
                  <div className="animate-shimmer h-7 w-24 rounded-full bg-[var(--surface-muted)]" />
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
        <div className="flex items-center gap-3">
          <Button icon={<ArrowLeft size={16} />} variant="ghost" onClick={onBack}>Back</Button>
          {loading ? (
            <div className="space-y-2">
              <div className="animate-shimmer h-8 w-44 rounded bg-[var(--surface-muted)]" />
              <div className="animate-shimmer h-4 w-32 rounded bg-[var(--surface-muted)]" />
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-semibold text-[var(--text)] tracking-wide">@{post.targetAccount.username}</h1>
              <p className="text-sm text-[var(--text-subtle)] font-mono">{post.instagramPostId}</p>
            </div>
          )}
        </div>
        {loading ? (
          <div className="animate-shimmer h-10 w-24 rounded-md bg-[var(--surface-muted)]" />
        ) : (
          <Button onClick={() => void reload()} variant="ghost">Refresh</Button>
        )}
      </div>

      {error && <div className="rounded-md border border-[color-mix(in_srgb,var(--danger)_22%,transparent)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">{error}</div>}
      {loading ? statusTableSkeleton : null}

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
                      {row.liked ? <Check className="text-[var(--success)]" size={18} /> : <X className="text-[var(--danger)]" size={18} />}
                    </td>
                    <td className="px-4 py-3">
                      {row.commented ? <Check className="text-[var(--accent)]" size={18} /> : <X className="text-[var(--danger)]" size={18} />}
                    </td>
                    <td className="px-4 py-3 font-bold text-[var(--warning)] font-mono">{row.score}</td>
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
