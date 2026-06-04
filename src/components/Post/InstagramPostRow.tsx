import { Check, ExternalLink, Loader2, Play } from "lucide-react";
import { useEffect, useState } from "react";
import type { PostSummary, ScrapeJob } from "../../types";
import { Button } from "../Button";

const CAPTION_PREVIEW_LIMIT = 90;

function formatCaptionPreview(caption?: string | null) {
  if (!caption) return "-";
  const normalizedCaption = caption.replace(/\s+/g, " ").trim();
  if (normalizedCaption.length <= CAPTION_PREVIEW_LIMIT) return normalizedCaption;
  return `${normalizedCaption.slice(0, CAPTION_PREVIEW_LIMIT).trimEnd()}...`;
}

export function InstagramPostRow({
  post,
  job,
  onFetch,
  onOpenPost,
  isLimitReached,
}: {
  post: PostSummary;
  job?: ScrapeJob;
  onFetch: (post: PostSummary) => void;
  onOpenPost: (post: PostSummary) => void;
  isLimitReached: boolean;
}) {
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  const isQueued = job?.status === "QUEUED";
  const isRunning = job?.status === "RUNNING";
  const isCompleted = job?.status === "COMPLETED";
  const isActive = isQueued || isRunning;

  useEffect(() => {
    if (!isActive) {
      setSimulatedProgress(0);
      return;
    }

    const calculateProgress = () => {
      if (!job?.createdAt) return 5;
      const startTime = new Date(job.createdAt).getTime();
      const elapsed = Date.now() - startTime;
      const duration = 25000;
      const percent = Math.min(95, Math.round((elapsed / duration) * 100));
      return Math.max(5, percent);
    };

    setSimulatedProgress(calculateProgress());

    const interval = setInterval(() => {
      setSimulatedProgress(calculateProgress());
    }, 500);

    return () => clearInterval(interval);
  }, [isActive, job]);

  let btnText = "Fetch";
  let btnIcon = <Play size={15} />;
  let btnDisabled = false;
  let btnClassName = "";
  let btnVariant: "primary" | "ghost" | "danger" = "ghost";

  if (isQueued) {
    btnText = "Queued";
    btnIcon = <Loader2 size={15} className="animate-spin text-[var(--text-subtle)]" />;
    btnDisabled = true;
  } else if (isRunning) {
    btnText = "Fetching";
    btnIcon = <Loader2 size={15} className="animate-spin text-[var(--accent)]" />;
    btnDisabled = true;
  } else if (isCompleted) {
    btnText = "Success";
    btnIcon = <Check size={15} />;
    btnDisabled = true;
    btnClassName = "border-[color-mix(in_srgb,var(--success)_34%,var(--border-soft))] bg-[color-mix(in_srgb,var(--success)_10%,var(--surface))] text-[var(--success)] font-semibold shadow-[inset_0_1px_0_color-mix(in_srgb,var(--success)_16%,transparent)] hover:bg-[color-mix(in_srgb,var(--success)_14%,var(--surface-hover))] hover:text-[var(--success)] disabled:opacity-100";
  } else if (job?.status === "FAILED") {
    btnText = "Failed";
    btnIcon = <Play size={15} />;
  } else if (isLimitReached) {
    btnDisabled = true;
  }

  return (
    <tr className="hover:bg-[var(--surface-hover)] transition-all">
      <td className="px-4 py-3 font-semibold text-[var(--text)]">
        @{post.targetAccount.username}
      </td>
      <td className="max-w-md px-4 py-3 text-[var(--text-muted)]">
        <span className="line-clamp-2" title={post.caption ?? undefined}>
          {formatCaptionPreview(post.caption)}
        </span>
      </td>
      <td className="px-4 py-3 text-[var(--text-subtle)]">
        {post.postedAt
          ? new Date(post.postedAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "-"}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="h-2.5 w-28 overflow-hidden rounded-full bg-[var(--surface-muted)] p-[1px] border border-[var(--border-soft)] relative">
            {isActive ? (
              <div
                className="h-full bg-[var(--accent)] rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_var(--accent)] animate-pulse"
                style={{ width: `${simulatedProgress}%` }}
              />
            ) : (
              <div
                className="h-full bg-[var(--accent)] rounded-full"
                style={{ width: `${post.engagementPercentage}%` }}
              />
            )}
          </div>
          {isActive ? (
            <span className="font-semibold text-[var(--accent)] font-mono animate-pulse">
              {simulatedProgress}%
            </span>
          ) : (
            <span className="font-semibold text-[var(--accent)] font-mono">
              {post.engagementPercentage}%
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end items-center gap-2">
          <Button
            icon={btnIcon}
            onClick={() => void onFetch(post)}
            variant={btnVariant}
            disabled={btnDisabled}
            className={btnClassName}
          >
            {btnText}
          </Button>

          <Button onClick={() => onOpenPost(post)} variant="ghost">
            Status
          </Button>

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
  );
}
