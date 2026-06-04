import { Instagram, Music2, Facebook } from "lucide-react";
import { useCallback, useState } from "react";
import { CustomSelect } from "../ui/select";
import { FacebookAccountManager } from "./FacebookAccountManager";
import { InstagramAccountManager } from "./InstagramAccountManager";
import { TikTokAccountManager } from "./TikTokAccountManager";

type SocialPlatform = "instagram" | "tiktok" | "facebook";
type AccountKind = "target" | "monitored";

const platformOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
];

const platformIcon = {
  instagram: <Instagram size={16} />,
  tiktok: <Music2 size={16} />,
  facebook: <Facebook size={16} />,
} satisfies Record<SocialPlatform, JSX.Element>;

export function SocialAccountPage({
  kind,
}: {
  kind: AccountKind;
}) {
  const [platform, setPlatform] = useState<SocialPlatform>("instagram");
  const [contentLoading, setContentLoading] = useState(platform === "instagram");
  const title = kind === "target" ? "Target Accounts" : "Monitored Accounts";
  const handlePlatformChange = (value: string) => {
    const nextPlatform = value as SocialPlatform;
    setPlatform(nextPlatform);
    setContentLoading(nextPlatform === "instagram");
  };
  const handleLoadingChange = useCallback((loading: boolean) => {
    setContentLoading(loading);
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {contentLoading ? (
            <div className="animate-shimmer h-10 w-10 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)]" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] text-[var(--accent)]">
              {platformIcon[platform]}
            </div>
          )}
          {contentLoading ? (
            <div className="space-y-2">
              <div className="animate-shimmer h-3 w-32 rounded bg-[var(--surface-muted)]" />
              <div className="animate-shimmer h-5 w-44 rounded bg-[var(--surface-muted)]" />
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                Social Platform
              </p>
              <h2 className="text-base font-semibold text-[var(--text)]">
                {title}
              </h2>
            </div>
          )}
        </div>

        {contentLoading ? (
          <div className="animate-shimmer h-10 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] sm:w-[180px]" />
        ) : (
          <CustomSelect
            value={platform}
            onChange={handlePlatformChange}
            options={platformOptions}
            className="sm:w-[180px]"
          />
        )}
      </div>

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
