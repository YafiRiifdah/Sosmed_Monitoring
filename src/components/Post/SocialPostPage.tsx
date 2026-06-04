import { useCallback, useState } from "react";
import type { PostSummary } from "../../types";
import { FacebookPostManager } from "./FacebookPostManager";
import { InstagramPostManager } from "./InstagramPostManager";
import { SocialPostHeader, type PostPlatform } from "./SocialPostHeader";
import { TikTokPostManager } from "./TikTokPostManager";

export function SocialPostPage({
  onOpenPost,
}: {
  onOpenPost: (post: PostSummary) => void;
}) {
  const [platform, setPlatform] = useState<PostPlatform>("instagram");
  const [contentLoading, setContentLoading] = useState(platform === "instagram");

  function handlePlatformChange(nextPlatform: PostPlatform) {
    setPlatform(nextPlatform);
    setContentLoading(nextPlatform === "instagram");
  }

  const handleLoadingChange = useCallback((loading: boolean) => {
    setContentLoading(loading);
  }, []);

  return (
    <div className="space-y-5 text-[var(--text-muted)]">
      <SocialPostHeader
        platform={platform}
        loading={platform === "instagram" && contentLoading}
        onPlatformChange={handlePlatformChange}
      />

      {platform === "instagram" ? (
        <InstagramPostManager
          onOpenPost={onOpenPost}
          onLoadingChange={handleLoadingChange}
        />
      ) : platform === "tiktok" ? (
        <TikTokPostManager />
      ) : (
        <FacebookPostManager />
      )}
    </div>
  );
}
