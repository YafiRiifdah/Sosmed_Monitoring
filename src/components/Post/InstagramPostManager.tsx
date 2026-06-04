import { ShieldAlert } from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../Button";
import { useAsync } from "../../hooks/useAsync";
import { api } from "../../services/api";
import type { Account, PostSummary, ScrapeJob } from "../../types";
import { InstagramPostToolbar } from "./InstagramPostToolbar";
import { InstagramPostsTable } from "./InstagramPostsTable";

function extractInstagramPostId(value: string) {
  return value.match(/\/(?:p|reel)\/([^/?#]+)/i)?.[1]?.toLowerCase() ?? "";
}

export function InstagramPostManager({
  onOpenPost,
  onLoadingChange,
}: {
  onOpenPost: (post: PostSummary) => void;
  onLoadingChange?: (loading: boolean) => void;
}) {
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
  
  // Load initial fetch jobs from localStorage to persist status when navigating pages
  const [fetchJobs, setFetchJobs] = useState<Record<string, ScrapeJob>>(() => {
    try {
      const saved = localStorage.getItem("active_fetch_jobs_ig");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Keep a ref of fetchJobs to access the latest state inside the interval without clearing it
  const fetchJobsRef = useRef(fetchJobs);
  useEffect(() => {
    fetchJobsRef.current = fetchJobs;
  }, [fetchJobs]);

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
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  // Persist fetchJobs to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("active_fetch_jobs_ig", JSON.stringify(fetchJobs));
    } catch (e) {
      console.error("Failed to save fetch jobs", e);
    }
  }, [fetchJobs]);

  const activeJobsList = Object.entries(fetchJobs).filter(
    ([, job]) => job.status === "QUEUED" || job.status === "RUNNING"
  );
  const hasActiveJobs = activeJobsList.length > 0;

  // Bersihkan job yang sudah selesai atau gagal dari state jika tidak ada lagi job aktif yang sedang berjalan (untuk menghindari tombol sukses tersangkut)
  useEffect(() => {
    if (!hasActiveJobs) {
      const finishedJobKeys = Object.entries(fetchJobs).filter(
        ([, job]) => job.status === "COMPLETED" || job.status === "FAILED"
      );
      if (finishedJobKeys.length > 0) {
        setFetchJobs((current) => {
          const next = { ...current };
          for (const [postId] of finishedJobKeys) {
            delete next[postId];
          }
          return next;
        });
      }
    }
  }, [hasActiveJobs, fetchJobs]);

  useEffect(() => {
    if (!hasActiveJobs) return;

    const timer = window.setInterval(async () => {
      const currentJobs = Object.entries(fetchJobsRef.current).filter(
        ([, job]) => job.status === "QUEUED" || job.status === "RUNNING"
      );
      if (currentJobs.length === 0) return;

      try {
        const updatedEntries = await Promise.all(
          currentJobs.map(async ([postId, job]) => {
            const latest = await api.job(job.id);
            return [postId, latest] as [string, ScrapeJob];
          })
        );

        // Batch reload check
        const anyFinished = updatedEntries.some(
          ([, job]) => job.status === "COMPLETED" || job.status === "FAILED"
        );
        const allFinished = updatedEntries.every(
          ([, job]) => job.status === "COMPLETED" || job.status === "FAILED"
        );

        if (anyFinished && allFinished) {
          await reload();

          // Bersihkan job yang sudah selesai agar baris-baris tombol langsung kembali ke "Fetch" secara serentak bersamaan dengan update data
          setFetchJobs((current) => {
            const next = { ...current };
            for (const [postId] of updatedEntries) {
              delete next[postId];
            }
            return next;
          });
        } else {
          // Update status saja
          setFetchJobs((current) => {
            const next = { ...current };
            for (const [postId, latest] of updatedEntries) {
              next[postId] = latest;
            }
            return next;
          });
        }
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Failed to refresh job status");
      }
    }, 2500);

    return () => window.clearInterval(timer);
  }, [hasActiveJobs, reload]);

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
    const activeCount = Object.values(fetchJobs).filter(
      (job) => job.status === "QUEUED" || job.status === "RUNNING"
    ).length;
    if (activeCount >= 5) {
      setFormError("Maksimal 5 proses fetch aktif diperbolehkan secara bersamaan.");
      return;
    }
    try {
      const job = await api.fetchEngagements(post.id);
      setFetchJobs((current) => ({ ...current, [post.id]: job }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to queue fetch job");
    }
  }

  const activeJobsCount = Object.values(fetchJobs).filter(
    (job) => job.status === "QUEUED" || job.status === "RUNNING"
  ).length;
  const isLimitReached = activeJobsCount >= 5;

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {loading ? (
          <div className="animate-shimmer h-8 w-24 rounded bg-[var(--surface-muted)]" />
        ) : (
          <h1 className="text-2xl font-semibold text-[var(--text)] tracking-wide">Posts</h1>
        )}
        {loading ? (
          <div className="animate-shimmer h-10 w-24 rounded-md bg-[var(--surface-muted)]" />
        ) : (
          <Button onClick={() => void reload()} variant="ghost">Refresh</Button>
        )}
      </div>

      <InstagramPostToolbar
        completionFilter={completionFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
        isLimitReached={isLimitReached}
        loading={loading}
        onlyTracked={onlyTracked}
        onCompletionFilterChange={setCompletionFilter}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onOnlyTrackedChange={setOnlyTracked}
        onPostUrlChange={setPostUrl}
        onQueryChange={setQuery}
        onSubmitTrackPost={submitTrackPost}
        onTargetAccountIdChange={setTargetAccountId}
        onTargetFilterChange={setTargetFilter}
        postUrl={postUrl}
        query={query}
        targetAccountId={targetAccountId}
        targetFilter={targetFilter}
        targets={targets}
      />

      {isLimitReached && (
        <div className="rounded-md border border-[color-mix(in_srgb,var(--warning)_22%,transparent)] bg-[var(--warning-soft)] p-3 text-sm text-[var(--warning)] flex items-center gap-2">
          <ShieldAlert size={16} className="shrink-0" />
          <span>Maksimal 5 proses fetch aktif diperbolehkan secara bersamaan. Silakan tunggu hingga proses selesai.</span>
        </div>
      )}
      {formError && <div className="rounded-md border border-[color-mix(in_srgb,var(--danger)_22%,transparent)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">{formError}</div>}
      {message && <div className="rounded-md border border-[var(--accent-ring)] bg-[var(--accent-soft)] p-3 text-sm text-[var(--accent)]">{message}</div>}
      {error && <div className="rounded-md border border-[color-mix(in_srgb,var(--danger)_22%,transparent)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">{error}</div>}
      <InstagramPostsTable
        fetchJobs={fetchJobs}
        isLimitReached={isLimitReached}
        loading={loading}
        onFetch={fetchPost}
        onOpenPost={onOpenPost}
        posts={posts}
      />
    </>
  );
}
