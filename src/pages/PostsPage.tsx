import { ExternalLink, Play, Plus, Search } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { useAsync } from "../hooks/useAsync";
import { api } from "../services/api";
import type { Account, PostSummary, ScrapeJob } from "../types";

const CAPTION_PREVIEW_LIMIT = 90;

function formatCaptionPreview(caption?: string | null) {
  if (!caption) return "-";
  const normalizedCaption = caption.replace(/\s+/g, " ").trim();
  if (normalizedCaption.length <= CAPTION_PREVIEW_LIMIT) return normalizedCaption;
  return `${normalizedCaption.slice(0, CAPTION_PREVIEW_LIMIT).trimEnd()}...`;
}

function extractInstagramPostId(value: string) {
  return value.match(/\/(?:p|reel)\/([^/?#]+)/i)?.[1]?.toLowerCase() ?? "";
}

export function PostsPage({ onOpenPost }: { onOpenPost: (post: PostSummary) => void }) {
  const { data, loading, error, reload } = useAsync(useCallback(() => api.posts(), []));
  const [targets, setTargets] = useState<Account[]>([]);
  const [query, setQuery] = useState("");
  const [targetAccountId, setTargetAccountId] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [targetFilter, setTargetFilter] = useState("all");
  const [completionFilter, setCompletionFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [onlyTracked, setOnlyTracked] = useState(false);
  const [fetchJobs, setFetchJobs] = useState<Record<string, ScrapeJob>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const queryPostId = extractInstagramPostId(query);
  const posts = (data ?? []).filter((post) => {
    const searchableText = `${post.targetAccount.username} ${post.caption ?? ""} ${post.instagramPostId} ${post.postUrl}`.toLowerCase();
    const matchesSearch = !normalizedQuery || searchableText.includes(normalizedQuery) || Boolean(queryPostId && post.instagramPostId.toLowerCase() === queryPostId);
    const matchesTarget = targetFilter === "all" || post.targetAccount.id === targetFilter;
    const matchesCompletion =
      completionFilter === "all" ||
      (completionFilter === "zero" && post.engagementPercentage === 0) ||
      (completionFilter === "incomplete" && post.engagementPercentage > 0 && post.engagementPercentage < 100) ||
      (completionFilter === "complete" && post.engagementPercentage === 100);
    const postedAtTime = post.postedAt ? new Date(post.postedAt).getTime() : undefined;
    const matchesDateFrom = !dateFrom || Boolean(postedAtTime && postedAtTime >= new Date(`${dateFrom}T00:00:00`).getTime());
    const matchesDateTo = !dateTo || Boolean(postedAtTime && postedAtTime <= new Date(`${dateTo}T23:59:59`).getTime());
    const matchesTracked = !onlyTracked || post.isManuallyTracked;
    return matchesSearch && matchesTarget && matchesCompletion && matchesDateFrom && matchesDateTo && matchesTracked;
  });

  useEffect(() => {
    void api.targetAccounts().then((accounts) => {
      setTargets(accounts.filter((account) => account.isActive));
      setTargetAccountId((current) => current || accounts.find((account) => account.isActive)?.id || "");
    });
  }, []);

  useEffect(() => {
    const activeJobs = Object.entries(fetchJobs).filter(([, job]) => job.status === "QUEUED" || job.status === "RUNNING");
    if (activeJobs.length === 0) return;

    const timer = window.setInterval(() => {
      void Promise.all(
        activeJobs.map(async ([postId, job]) => {
          const latest = await api.job(job.id);
          setFetchJobs((current) => ({ ...current, [postId]: latest }));
          if (latest.status === "COMPLETED") await reload();
        })
      ).catch((err) => setFormError(err instanceof Error ? err.message : "Failed to refresh job status"));
    }, 2500);

    return () => window.clearInterval(timer);
  }, [fetchJobs, reload]);

  async function submitTrackPost(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setMessage(null);
    try {
      const trackedPostUrl = postUrl;
      await api.trackPost({ targetAccountId, postUrl: trackedPostUrl });
      setPostUrl("");
      setQuery(extractInstagramPostId(trackedPostUrl) || trackedPostUrl);
      setMessage("Post tracked");
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to track post");
    }
  }

  async function fetchPost(post: PostSummary) {
    setFormError(null);
    setMessage(null);
    try {
      const job = await api.fetchEngagements(post.id);
      setFetchJobs((current) => ({ ...current, [post.id]: job }));
      setMessage("Fetch job queued");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to queue fetch job");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <Button onClick={() => void reload()} variant="ghost">Refresh</Button>
      </div>
      <form onSubmit={(event) => void submitTrackPost(event)} className="grid gap-3 rounded-md border border-line bg-white p-4 md:grid-cols-[260px_1fr_auto]">
        <select
          className="h-10 rounded-md border border-line px-3 text-sm"
          value={targetAccountId}
          onChange={(event) => setTargetAccountId(event.target.value)}
          required
        >
          <option value="" disabled>Select target</option>
          {targets.map((target) => (
            <option key={target.id} value={target.id}>
              @{target.username}
            </option>
          ))}
        </select>
        <input
          className="h-10 rounded-md border border-line px-3 text-sm"
          placeholder="https://www.instagram.com/p/..."
          value={postUrl}
          onChange={(event) => setPostUrl(event.target.value)}
          required
        />
        <Button icon={<Plus size={16} />} type="submit">Track</Button>
      </form>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 text-slate-400" size={17} />
        <input
          className="h-10 w-full rounded-md border border-line pl-9 pr-3 text-sm"
          placeholder="Search posts"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="grid gap-3 rounded-md border border-line bg-white p-4 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <select
          className="h-10 rounded-md border border-line px-3 text-sm"
          value={targetFilter}
          onChange={(event) => setTargetFilter(event.target.value)}
        >
          <option value="all">All targets</option>
          {targets.map((target) => (
            <option key={target.id} value={target.id}>
              @{target.username}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-md border border-line px-3 text-sm"
          value={completionFilter}
          onChange={(event) => setCompletionFilter(event.target.value)}
        >
          <option value="all">All completion</option>
          <option value="zero">0%</option>
          <option value="incomplete">Incomplete</option>
          <option value="complete">Complete</option>
        </select>
        <input className="h-10 rounded-md border border-line px-3 text-sm" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
        <input className="h-10 rounded-md border border-line px-3 text-sm" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
        <label className="flex h-10 items-center gap-2 text-sm">
          <input type="checkbox" checked={onlyTracked} onChange={(event) => setOnlyTracked(event.target.checked)} />
          Manual only
        </label>
      </div>
      {formError && <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{formError}</div>}
      {message && <div className="rounded-md border border-teal-200 bg-teal-50 p-3 text-sm text-teal-700">{message}</div>}
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
                <td className="max-w-md px-4 py-3 text-slate-600">
                  <span className="line-clamp-2" title={post.caption ?? undefined}>
                    {formatCaptionPreview(post.caption)}
                  </span>
                </td>
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
                    <Button icon={<Play size={15} />} onClick={() => void fetchPost(post)} variant="ghost">Fetch</Button>
                    {fetchJobs[post.id] && (
                      <span className={`inline-flex h-10 items-center rounded-md border px-3 text-xs font-semibold ${
                        fetchJobs[post.id].status === "COMPLETED"
                          ? "border-teal-200 bg-teal-50 text-teal-700"
                          : fetchJobs[post.id].status === "FAILED"
                            ? "border-rose-200 bg-rose-50 text-rose-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                      }`}>
                        {fetchJobs[post.id].status.toLowerCase()}
                      </span>
                    )}
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
