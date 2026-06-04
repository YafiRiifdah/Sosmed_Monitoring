import { Facebook, Instagram, Music2 } from "lucide-react";
import { Card } from "../Card";
import { EmptyState } from "../EmptyState";

type SocialPlatform = "instagram" | "tiktok" | "facebook";
type AccountKind = "target" | "monitored";

const platformMeta: Record<
  SocialPlatform,
  {
    label: string;
    icon: JSX.Element;
    tone: string;
  }
> = {
  instagram: {
    label: "Instagram",
    icon: <Instagram size={22} />,
    tone: "text-[var(--accent)]",
  },
  tiktok: {
    label: "TikTok",
    icon: <Music2 size={22} />,
    tone: "text-[var(--info)]",
  },
  facebook: {
    label: "Facebook",
    icon: <Facebook size={22} />,
    tone: "text-[var(--accent-secondary)]",
  },
};

export function SocialAccountPlaceholder({
  platform,
  kind,
}: {
  platform: Exclude<SocialPlatform, "instagram">;
  kind: AccountKind;
}) {
  const meta = platformMeta[platform];
  const accountLabel = kind === "target" ? "akun target" : "akun wajib PAC";

  return (
    <div className="space-y-6 text-[var(--text-muted)]">
      <section className="rounded-2xl border border-[var(--border-soft)] bg-[linear-gradient(135deg,var(--surface),var(--surface-muted))] p-5 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-subtle)]">
              Account Management
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
              {meta.label} {kind === "target" ? "Target Accounts" : "Monitored Accounts"}
            </h1>
            <p className="mt-1 text-sm text-[var(--text-subtle)]">
              Halaman {accountLabel} {meta.label} sudah disiapkan tanpa koneksi backend.
            </p>
          </div>

          <div className={`flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] ${meta.tone}`}>
            {meta.icon}
          </div>
        </div>
      </section>

      <Card className="border-dashed border-[var(--border)] bg-[var(--surface-muted)] py-12">
        <EmptyState
          message={`Data ${accountLabel} ${meta.label} belum tersedia karena endpoint backend/API belum dibuat.`}
        />
      </Card>
    </div>
  );
}
