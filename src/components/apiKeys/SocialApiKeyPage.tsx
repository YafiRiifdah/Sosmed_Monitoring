import { useCallback, useEffect, useState } from "react";
import { FacebookApiKeyManager } from "./FacebookApiKeyManager";
import { InstagramApiKeyManager } from "./InstagramApiKeyManager";
import type { ApiKeyPlatform } from "./SocialApiKeyHeader";
import { TikTokApiKeyManager } from "./TikTokApiKeyManager";

export function SocialApiKeyPage({
  initialPlatform = "instagram",
}: {
  initialPlatform?: ApiKeyPlatform;
}) {
  const [platform, setPlatform] = useState<ApiKeyPlatform>(initialPlatform);
  const [contentLoading, setContentLoading] = useState(initialPlatform === "instagram");

  const handleLoadingChange = useCallback((loading: boolean) => {
    setContentLoading(loading);
  }, []);

  useEffect(() => {
    setPlatform(initialPlatform);
    setContentLoading(initialPlatform === "instagram");
  }, [initialPlatform]);

  return (
    <div className="space-y-5 text-[var(--text-muted)]">
      {platform === "instagram" ? (
        <InstagramApiKeyManager onLoadingChange={handleLoadingChange} />
      ) : platform === "tiktok" ? (
        <TikTokApiKeyManager />
      ) : (
        <FacebookApiKeyManager />
      )}
    </div>
  );
}
