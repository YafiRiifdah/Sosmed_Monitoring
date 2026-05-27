import { ExternalLink, Search } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { useAsync } from "../hooks/useAsync";
import { api } from "../services/api";
import type { PostSummary } from "../types";

export function PostsPage({ onOpenPost }: { onOpenPost: (post: PostSummary) => void }) {
  const { data, loading, error, reload } = useAsync(useCallback(() => api.posts(), []));
  const [query, setQuery] = useState("");
  const posts = (data ?? []).filter((post) =>
    `${post.targetAccount.username} ${post.caption ?? ""}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <Button onClick={() => void reload()} variant="ghost">Refresh</Button>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
        <input
          className="h-10 w-full rounded-md border border-line pl-9 pr-3 text-sm"
          placeholder="Search posts"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {error && <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      {loading ? <div className="text-sm text-slate-500">Loading...</div> : null}
      {!loading && posts.length === 0 ? <EmptyState message="No posts discovered yet." /> : null}
      <div className="overflow-hidden rounded-md border border-line bg-white">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="bg-mist text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Caption</th>
              <th className="px-4 py-3">Post Date</th>
              <th className="px-4 py-3">Engagement</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium">@{post.targetAccount.username}</td>
                <td className="max-w-md px-4 py-3 text-slate-600">{post.caption ? post.caption.slice(0, 100) : "-"}</td>
                <td className="px-4 py-3 text-slate-600">{post.postedAt ? new Date(post.postedAt).toLocaleDateString() : "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-28 overflow-hidden rounded-md bg-slate-200">
                      <div className="h-full bg-teal-600" style={{ width: `${post.engagementPercentage}%` }} />
                    </div>
                    <span>{post.engagementPercentage}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button onClick={() => onOpenPost(post)} variant="ghost">Status</Button>
                    <a className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-white px-3 text-sm font-medium text-ink" href={post.postUrl} target="_blank" rel="noreferrer">
                      <ExternalLink size={16} />
                    </a>
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
