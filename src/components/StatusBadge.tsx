import type { PostStatus } from "../types";
import { UiBadge } from "./ui/badge";

const statusTone: Record<PostStatus, "complete" | "likeOnly" | "commentOnly" | "likeUnavailable" | "missing"> = {
  COMPLETE: "complete",
  LIKE_ONLY: "likeOnly",
  COMMENT_ONLY: "commentOnly",
  LIKE_UNAVAILABLE: "likeUnavailable",
  MISSING: "missing"
};

export function StatusBadge({ status }: { status: PostStatus }) {
  const label = status.replace("_", " ");
  return <UiBadge tone={statusTone[status]}>{label}</UiBadge>;
}
