import { Layers, RefreshCw, Server, Shield, Sparkles } from "lucide-react";
import { Card } from "../Card";

type ApiKeySupportSectionProps = {
  loading: boolean;
  rotationStats: {
    rotationCount: number;
    history: any[];
  };
};

export function ApiKeySupportSection({ loading, rotationStats }: ApiKeySupportSectionProps) {
  const roadmapSkeleton = (
    <div className="pt-4">
      <div className="mb-4 flex items-center gap-2">
        <div className="animate-shimmer h-5 w-5 rounded bg-[var(--surface-muted)]" />
        <div className="animate-shimmer h-6 w-80 max-w-full rounded bg-[var(--surface-muted)]" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="border-[var(--border-soft)] bg-[var(--surface-muted)]">
            <div className="flex items-start gap-3">
              <div className="animate-shimmer h-8 w-8 shrink-0 rounded-lg bg-[var(--surface)]" />
              <div className="w-full space-y-2">
                <div className="animate-shimmer h-4 w-40 rounded bg-[var(--surface)]" />
                <div className="animate-shimmer h-3 w-full rounded bg-[var(--surface)]" />
                <div className="animate-shimmer h-3 w-5/6 rounded bg-[var(--surface)]" />
                <div className="animate-shimmer h-3 w-2/3 rounded bg-[var(--surface)]" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {loading ? roadmapSkeleton : (
        <div className="pt-4">
          <h2 className="text-lg font-semibold mb-4 text-[var(--text)] flex items-center gap-2 tracking-wide">
            <Sparkles className="text-[var(--warning)]" size={19} />
            Panduan Skalabilitas: Ternak Banyak Akun & Rotasi API
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-[var(--border-soft)] bg-[var(--surface-muted)] hover:border-[var(--accent-ring)] transition-all duration-300">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--accent)]">
                  <Layers size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-muted)]">1. Rotasi API KEY (RapidAPI)</h3>
                  <p className="text-xs text-[var(--text-subtle)] mt-1.5 leading-relaxed">
                    Anda dapat mendaftarkan banyak akun gratisan dengan tombol di atas. Backend secara otomatis merekam kredensial aslinya ke dalam file database terenkripsi yang aman dari kebocoran Git.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-[var(--border-soft)] bg-[var(--surface-muted)] hover:border-[var(--accent-ring)] transition-all duration-300">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--accent)]">
                  <Server size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-muted)]">2. Hybrid Rantai 3-Tingkat</h3>
                  <p className="text-xs text-[var(--text-subtle)] mt-1.5 leading-relaxed">
                    Gabungkan **RapidAPI** (prioritas utama) + **Apify** (cadangan token gratis) + **Playwright Local** (fallback otomatis gratis selamanya). Menjamin kelancaran scraping tanpa downtime dengan pengeluaran Rp0.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-[var(--border-soft)] bg-[var(--surface-muted)] hover:border-[color-mix(in_srgb,var(--success)_22%,transparent)] transition-all duration-300">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--success)]">
                  <Shield size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-muted)]">3. Dashboard Terkonsolidasi</h3>
                  <p className="text-xs text-[var(--text-subtle)] mt-1.5 leading-relaxed">
                    Semua kunci baru yang Anda daftarkan di sini langsung terhubung secara real-time ke sistem scraping, mendeteksi status keaktifan kuota sisa tanpa perlu me-restart kontainer sama sekali!
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {!loading && (
        <div className="pt-4">
          <h2 className="text-lg font-semibold mb-4 text-[var(--text)] tracking-wide flex items-center gap-2 animate-fade-in">
            <RefreshCw className="text-[var(--accent)]" size={19} />
            Riwayat Rotasi API KEY (Logs)
          </h2>

          <Card className="border-[var(--border-soft)] bg-[var(--surface-muted)] p-4 max-h-[320px] overflow-y-auto">
            {rotationStats.history && rotationStats.history.length > 0 ? (
              <div className="space-y-4">
                {rotationStats.history.map((event: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 border-b border-[var(--border-soft)] pb-3 last:border-0 last:pb-0">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--text-subtle)] mt-0.5 border border-[var(--border-soft)]">
                      <span className="text-xxs font-bold text-[var(--accent)]">{rotationStats.history.length - idx}</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
                          {event.reason}
                        </span>
                        <span className="text-[var(--text-subtle)] text-[10px]">
                          {new Date(event.timestamp).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-subtle)] font-mono">
                        Transisi API KEY: <span className="text-[var(--danger)]">{event.fromKey}</span> &rarr; <span className="text-[var(--success)]">{event.toKey}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-[var(--text-subtle)]">
                Belum ada riwayat rotasi API KEY yang tercatat. Sistem akan mencatat riwayat perpindahan API KEY di sini.
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
