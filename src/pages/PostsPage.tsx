import { ExternalLink, Play, Plus, Search } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "../components/Button";
import { CustomSelect } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
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
      setMessage("Post tracked successfully");
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
    <div className="space-y-5 text-[var(--text-muted)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-[var(--text)] tracking-wide">Posts</h1>
        <Button onClick={() => void reload()} variant="ghost">Refresh</Button>
      </div>

      {/* Add Tracked Post Form */}
      <form onSubmit={(event) => void submitTrackPost(event)} className="grid gap-3 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 backdrop-blur-xl md:grid-cols-[260px_1fr_auto]">
        <CustomSelect
          value={targetAccountId}
          onChange={setTargetAccountId}
          options={targets.map((target) => ({ value: target.id, label: `@${target.username}` }))}
          placeholder="Select target"
          className="w-full"
        />
        <Input
          placeholder="https://www.instagram.com/p/..."
          value={postUrl}
          onChange={(event) => setPostUrl(event.target.value)}
          required
        />
        <Button icon={<Plus size={16} />} type="submit">Track</Button>
      </form>

      {/* Search Input */}
      <div className="max-w-md">
        <Input
          placeholder="Cari postingan..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          icon={<Search size={17} />}
        />
      </div>

      {/* Filter Options */}
      <div className="grid gap-3 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 backdrop-blur-xl md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <CustomSelect
          value={targetFilter}
          onChange={setTargetFilter}
          options={[
            { value: "all", label: "All targets" },
            ...targets.map((target) => ({ value: target.id, label: `@${target.username}` }))
          ]}
          placeholder="All targets"
          className="w-full"
        />
        <CustomSelect
          value={completionFilter}
          onChange={setCompletionFilter}
          options={[
            { value: "all", label: "All completion" },
            { value: "zero", label: "0%" },
            { value: "incomplete", label: "Incomplete" },
            { value: "complete", label: "Complete" }
          ]}
          placeholder="All completion"
          className="w-full"
        />
        <Input 
          type="date" 
          value={dateFrom} 
          onChange={(event) => setDateFrom(event.target.value)} 
        />
        <Input 
          type="date" 
          value={dateTo} 
          onChange={(event) => setDateTo(event.target.value)} 
        />
        <Checkbox 
          checked={onlyTracked} 
          onChange={(event) => setOnlyTracked(event.target.checked)} 
          label="Manual Only"
        />
      </div>

      {formError && <div className="rounded-md border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">{formError}</div>}
      {message && <div className="rounded-md border border-[var(--accent-ring)] bg-[var(--accent-soft)] p-3 text-sm text-[var(--accent)]">{message}</div>}
      {error && <div className="rounded-md border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</div>}
      {loading ? <div className="text-sm text-[var(--text-subtle)] animate-pulse">Loading posts...</div> : null}
      {!loading && posts.length === 0 ? <EmptyState message="Belum ada postingan yang ditemukan." /> : null}

      {!loading && posts.length > 0 && (
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
                  <tr key={post.id} className="hover:bg-[var(--surface-hover)] transition-all">
                    <td className="px-4 py-3 font-semibold text-[var(--text)]">@{post.targetAccount.username}</td>
                    <td className="max-w-md px-4 py-3 text-[var(--text-muted)]">
                      <span className="line-clamp-2" title={post.caption ?? undefined}>
                        {formatCaptionPreview(post.caption)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-subtle)]">{post.postedAt ? new Date(post.postedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-2.5 w-28 overflow-hidden rounded-full bg-[var(--surface-muted)] p-[1px] border border-[var(--border-soft)]">
                          <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${post.engagementPercentage}%` }} />
                        </div>
                        <span className="font-semibold text-[var(--accent)] font-mono">{post.engagementPercentage}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end items-center gap-2">
                        <Button icon={<Play size={15} />} onClick={() => void fetchPost(post)} variant="ghost">Fetch</Button>
                        
                        {fetchJobs[post.id] && (
                          <span className={`inline-flex h-10 items-center rounded-md border px-3 text-xs font-semibold ${
                            fetchJobs[post.id].status === "COMPLETED"
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                              : fetchJobs[post.id].status === "FAILED"
                                ? "border-rose-500/20 bg-rose-500/10 text-rose-300"
                                : "border-amber-500/20 bg-amber-500/10 text-amber-300"
                          }`}>
                            {fetchJobs[post.id].status.toLowerCase()}
                          </span>
                        )}

                        <Button onClick={() => onOpenPost(post)} variant="ghost">Status</Button>
                        <a 
                          className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] transition-all active:scale-95" 
                          href={post.postUrl} 
                          target="_blank" 
                          rel="noreferrer"
                        >
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
      )}
    </div>
  );
}
