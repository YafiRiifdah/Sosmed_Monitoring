import type { PostSummary } from "../../types";
import { FacebookPostManager } from "./FacebookPostManager";
import { InstagramPostManager } from "./InstagramPostManager";
import type { PostPlatform } from "./SocialPostHeader";
import { TikTokPostManager } from "./TikTokPostManager";

export function SocialPostPage({
  initialPlatform = "instagram",
  onOpenPost,
}: {
  initialPlatform?: PostPlatform;
  onOpenPost: (post: PostSummary) => void;
}) {
  return (
    <div className="space-y-5 text-[var(--text-muted)]">
      {initialPlatform === "instagram" ? (
        <InstagramPostManager onOpenPost={onOpenPost} />
      ) : initialPlatform === "tiktok" ? (
        <TikTokPostManager />
      ) : (
        <FacebookPostManager />
      )}
    </div>
  );
}
