import type { PostStatus } from "../types";

export function StatusBadge({ status }: { status: PostStatus }) {
  const label = status.replace("_", " ");
  return (
    <span className={`inline-flex min-w-24 justify-center rounded-md border px-2 py-1 text-xs font-semibold status-${status.toLowerCase()}`}>
      {label}
    </span>
  );
}
