import type { PostSummary, ScrapeJob } from "../../types";
import { EmptyState } from "../EmptyState";
import { InstagramPostRow } from "./InstagramPostRow";

type Props = {
  fetchJobs: Record<string, ScrapeJob>;
  isLimitReached: boolean;
  loading: boolean;
  onFetch: (post: PostSummary) => void;
  onOpenPost: (post: PostSummary) => void;
  posts: PostSummary[];
};

export function InstagramPostsTable({
  fetchJobs,
  isLimitReached,
  loading,
  onFetch,
  onOpenPost,
  posts,
}: Props) {
  if (loading) {
    return <InstagramPostsTableSkeleton />;
  }

  if (posts.length === 0) {
    return <EmptyState message="Belum ada postingan yang ditemukan." />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--surface)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="bg-[var(--surface-muted)] text-xs uppercase text-[var(--text-subtle)] border-b border-[var(--border-soft)]">
            <tr>
              <th className="px-4 py-3.5">Target</th>
              <th className="px-4 py-3.5">Caption</th>
              <th className="px-4 py-3.5">Post Date</th>
              <th className="px-4 py-3.5">Engagement</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-soft)]">
            {posts.map((post) => (
              <InstagramPostRow
                key={post.id}
                post={post}
                job={fetchJobs[post.id]}
                onFetch={onFetch}
                onOpenPost={onOpenPost}
                isLimitReached={isLimitReached}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InstagramPostsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--surface)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="border-b border-[var(--border-soft)] bg-[var(--surface-muted)] text-xs uppercase text-[var(--text-subtle)]">
            <tr>
              <th className="px-4 py-3.5">Target</th>
              <th className="px-4 py-3.5">Caption</th>
              <th className="px-4 py-3.5">Post Date</th>
              <th className="px-4 py-3.5">Engagement</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border-soft)]">
            {Array.from({ length: 6 }).map((_, index) => (
              <tr key={index}>
                <td className="px-4 py-3">
                  <div className="animate-shimmer h-4 w-28 rounded bg-[var(--surface-muted)]" />
                </td>
                <td className="max-w-md px-4 py-3">
                  <div className="space-y-2">
                    <div className="animate-shimmer h-3.5 w-full rounded bg-[var(--surface-muted)]" />
                    <div className="animate-shimmer h-3.5 w-2/3 rounded bg-[var(--surface-muted)]" />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="animate-shimmer h-4 w-24 rounded bg-[var(--surface-muted)]" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="animate-shimmer h-2.5 w-28 rounded-full bg-[var(--surface-muted)]" />
                    <div className="animate-shimmer h-4 w-10 rounded bg-[var(--surface-muted)]" />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <div className="animate-shimmer h-10 w-20 rounded-md bg-[var(--surface-muted)]" />
                    <div className="animate-shimmer h-10 w-20 rounded-md bg-[var(--surface-muted)]" />
                    <div className="animate-shimmer h-10 w-10 rounded-md bg-[var(--surface-muted)]" />
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
