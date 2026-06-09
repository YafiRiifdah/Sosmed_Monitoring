import { useCallback, useEffect, useState } from "react";
import { FacebookAccountManager } from "./FacebookAccountManager";
import { InstagramAccountManager } from "./InstagramAccountManager";
import { TikTokAccountManager } from "./TikTokAccountManager";

export type SocialPlatform = "instagram" | "tiktok" | "facebook";
type AccountKind = "target" | "monitored";

export function SocialAccountPage({
  initialPlatform = "instagram",
  kind,
}: {
  initialPlatform?: SocialPlatform;
  kind: AccountKind;
}) {
  const [platform, setPlatform] = useState<SocialPlatform>(initialPlatform);
  const [contentLoading, setContentLoading] = useState(initialPlatform === "instagram");
  const title = kind === "target" ? "Target Accounts" : "Monitored Accounts";
  const handleLoadingChange = useCallback((loading: boolean) => {
    setContentLoading(loading);
  }, []);

  useEffect(() => {
    setPlatform(initialPlatform);
    setContentLoading(initialPlatform === "instagram");
  }, [initialPlatform]);

  return (
    <div className="space-y-5">
      {platform === "instagram" ? (
        <InstagramAccountManager
          title={`Instagram ${title}`}
          kind={kind}
          onLoadingChange={handleLoadingChange}
        />
      ) : platform === "tiktok" ? (
        <TikTokAccountManager kind={kind} />
      ) : (
        <FacebookAccountManager kind={kind} />
      )}
    </div>
  );
}
