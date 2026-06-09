import { Facebook, Instagram, KeyRound, Music2 } from "lucide-react";
import { CustomSelect } from "../ui/select";

export type ApiKeyPlatform = "instagram" | "tiktok" | "facebook";

const platformOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
];

const platformIcon = {
  instagram: <Instagram size={16} />,
  tiktok: <Music2 size={16} />,
  facebook: <Facebook size={16} />,
} satisfies Record<ApiKeyPlatform, JSX.Element>;

type Props = {
  loading?: boolean;
  onPlatformChange: (platform: ApiKeyPlatform) => void;
  platform: ApiKeyPlatform;
};

export function SocialApiKeyHeader({ loading = false, onPlatformChange, platform }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {loading ? (
          <div className="animate-shimmer h-10 w-10 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)]" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] text-[var(--accent)]">
            {platformIcon[platform] ?? <KeyRound size={16} />}
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            <div className="animate-shimmer h-3 w-32 rounded bg-[var(--surface-muted)]" />
            <div className="animate-shimmer h-5 w-28 rounded bg-[var(--surface-muted)]" />
          </div>
        ) : (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-subtle)]">
              Social Platform
            </p>
            <h2 className="text-base font-semibold text-[var(--text)]">
              API Quota
            </h2>
          </div>
        )}
      </div>

      {loading ? (
        <div className="animate-shimmer h-10 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] sm:w-[180px]" />
      ) : (
        <CustomSelect
          value={platform}
          onChange={(value) => onPlatformChange(value as ApiKeyPlatform)}
          options={platformOptions}
          className="sm:w-[180px]"
        />
      )}
    </div>
  );
}
