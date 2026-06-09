import { Calendar, Key, Layers, Plus, RefreshCw, Server, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../Button";
import { Card } from "../Card";
import { Skeleton } from "../Skeleton";

type ApiKeyProvider = "rapidapi" | "apify";

type ApiKeyOverviewSectionProps = {
  activationLoading: string | null;
  activeKeyName: string;
  apiAccountsList: any[];
  apiUsageList: any[];
  error?: string | null;
  formError: string | null;
  formSuccess: string | null;
  isModalOpen: boolean;
  loading: boolean;
  onActivateKey: (provider: ApiKeyProvider, apiKeyMasked: string) => void;
  onOpenRegisterModal: () => void;
  onRefresh: () => void;
  onVerifyKey: (provider: ApiKeyProvider, apiKeyMasked: string) => void;
  overallPct: number;
  rotationCount: number;
  totalKeys: number;
  totalLimit: number;
  totalRemaining: number;
  totalUsed: number;
  verificationLoading: string | null;
};

export function ApiKeyOverviewSection({
  activationLoading,
  activeKeyName,
  apiAccountsList,
  apiUsageList,
  error,
  formError,
  formSuccess,
  isModalOpen,
  loading,
  onActivateKey,
  onOpenRegisterModal,
  onRefresh,
  onVerifyKey,
  overallPct,
  rotationCount,
  totalKeys,
  totalLimit,
  totalRemaining,
  totalUsed,
  verificationLoading
}: ApiKeyOverviewSectionProps) {
  const apifyPlaceholderSkeleton = (
    <Card className="relative overflow-hidden border-[var(--border-soft)] bg-[var(--surface-muted)]">
      <div className="absolute right-3 top-3">
        <div className="animate-shimmer h-5 w-20 rounded-full bg-[var(--surface)]" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="animate-shimmer h-10 w-10 rounded-lg bg-[var(--surface)]" />
          <div className="space-y-2">
            <div className="animate-shimmer h-4 w-44 rounded bg-[var(--surface)]" />
            <div className="animate-shimmer h-3 w-28 rounded bg-[var(--surface)]" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between gap-3">
            <div className="animate-shimmer h-3 w-32 rounded bg-[var(--surface)]" />
            <div className="animate-shimmer h-3 w-36 rounded bg-[var(--surface)]" />
          </div>
          <div className="animate-shimmer h-2.5 rounded-full bg-[var(--surface)]" />
        </div>

        <div className="space-y-2 pt-1">
          <div className="animate-shimmer h-3 w-full rounded bg-[var(--surface)]" />
          <div className="animate-shimmer h-3 w-4/5 rounded bg-[var(--surface)]" />
        </div>
      </div>
    </Card>
  );

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {loading ? (
          <div className="space-y-2">
            <div className="animate-shimmer h-8 w-64 rounded bg-[var(--surface-muted)]" />
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text)] tracking-wide">API Quota Monitor</h1>
          </div>
        )}
        {loading ? (
          <div className="flex flex-wrap gap-2">
            <div className="animate-shimmer h-10 w-36 rounded-md bg-[var(--surface-muted)]" />
            <div className="animate-shimmer h-10 w-32 rounded-md bg-[var(--surface-muted)]" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              icon={<RefreshCw className={loading ? "animate-spin" : ""} size={16} />}
              onClick={onRefresh}
            >
              Refresh Quota
            </Button>
            <Button icon={<Plus size={16} />} onClick={onOpenRegisterModal}>
              Register Key
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-[color-mix(in_srgb,var(--danger)_22%,transparent)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}
      {!isModalOpen && formError && (
        <div className="rounded-md border border-[color-mix(in_srgb,var(--danger)_22%,transparent)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">
          {formError}
        </div>
      )}
      {!isModalOpen && formSuccess && (
        <div className="rounded-md border border-[color-mix(in_srgb,var(--success)_22%,transparent)] bg-[var(--success-soft)] p-3 text-sm text-[var(--success)] flex items-center gap-2">
          <Shield size={16} className="text-[var(--success)] shrink-0" />
          <span>{formSuccess}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <Skeleton variant="card" count={4} />
        ) : (
          <>
            <Card className="border-[var(--border-soft)] bg-[var(--surface-muted)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success-soft)] text-[var(--success)]">
                  <Shield size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xxs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">API KEY Aktif</div>
                  <div className="text-sm font-semibold text-[var(--text)] truncate" title={activeKeyName}>
                    {activeKeyName}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-[var(--border-soft)] bg-[var(--surface-muted)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Zap size={20} />
                </div>
                <div>
                  <div className="text-xxs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">Sisa Total Kuota</div>
                  <div className="text-sm font-bold text-[var(--text)]">
                    {totalRemaining} / {totalLimit} Req
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-[var(--border-soft)] bg-[var(--surface-muted)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--warning-soft)] text-[var(--warning)]">
                  <RefreshCw size={20} />
                </div>
                <div>
                  <div className="text-xxs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">Total Rotasi API KEY</div>
                  <div className="text-sm font-bold text-[var(--text)]">{rotationCount} Kali</div>
                </div>
              </div>
            </Card>

            <Card className="border-[var(--border-soft)] bg-[var(--surface-muted)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--info-soft)] text-[var(--info)]">
                  <Layers size={20} />
                </div>
                <div>
                  <div className="text-xxs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">API KEY Terdaftar</div>
                  <div className="text-sm font-bold text-[var(--text)]">{totalKeys} Akun</div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {loading ? (
          <Skeleton variant="card" count={2} />
        ) : apiAccountsList.length > 0 ? (
          apiAccountsList.map((acc: any) => {
            const usage = apiUsageList.find((u: any) => u.key === acc.apiKeyMasked);
            const limit = usage?.limit ?? 100;
            const remaining = usage?.remaining ?? 100;
            const pct = limit === 0 ? 0 : Math.round((remaining / limit) * 100);
            const isExhausted = remaining === 0 || acc.status === "exhausted";
            const isLow = remaining > 0 && remaining < 20;
            const isActive = acc.status === "active";

            return (
              <Card key={acc.id} className={`relative overflow-hidden border-[var(--border-soft)] hover:border-[var(--accent-ring)] ${isActive ? "ring-1 ring-[var(--accent-ring)] bg-[var(--surface-strong)]" : ""}`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-muted)] ${isActive ? "text-[var(--success)]" : "text-[var(--accent)]"}`}>
                        <Key size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
                          {acc.accountName}
                          {isActive && <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse" />}
                        </div>
                        <div className="text-xs text-[var(--text-subtle)] font-mono tracking-tight">{acc.apiKeyMasked}</div>
                      </div>
                    </div>
                    <div>
                      {isActive ? (
                        <span className="inline-flex items-center rounded-full bg-[var(--success-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--success)] border border-[color-mix(in_srgb,var(--success)_22%,transparent)]">
                          Active
                        </span>
                      ) : isExhausted ? (
                        <span className="inline-flex items-center rounded-full bg-[var(--danger-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--danger)] border border-[color-mix(in_srgb,var(--danger)_22%,transparent)]">
                          Exhausted
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--text-subtle)] border border-[var(--border-soft)]">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-[var(--text-subtle)]">
                      <span>Available Credits</span>
                      <span className="font-semibold text-[var(--text-muted)]">
                        {usage ? `${remaining} / ${limit} Requests` : "Belum Digunakan (Sync Pending)"}
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-muted)] p-[1px] border border-[var(--border-soft)]">
                      <div
                        className={`h-full rounded-full ${usage ? (isExhausted ? "bg-[var(--danger)]" : isLow ? "bg-[var(--warning)]" : "bg-[var(--accent)]") : "bg-[var(--text-subtle)]"
                          }`}
                        style={{ width: usage ? `${pct}%` : "100%" }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 pt-3 border-t border-[var(--border-soft)] text-xs text-[var(--text-subtle)] items-center justify-between">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {usage?.resetAt && (
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-[var(--text-subtle)]" />
                          <span>Reset: {new Date(usage.resetAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                        </div>
                      )}
                      {usage?.updatedAt && (
                        <div className="flex items-center gap-1.5">
                          <Zap size={14} className="text-[var(--text-subtle)]" />
                          <span>Sync: {new Date(usage.updatedAt).toLocaleTimeString("id-ID")}</span>
                        </div>
                      )}
                      {!usage && (
                        <div className="flex items-center gap-1.5 text-[var(--warning)]">
                          <Zap size={14} />
                          <span>Sistem akan mensinkronisasi saat scraping dipicu</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        className="text-xs hover:text-[var(--accent)] px-2.5 py-1 h-auto"
                        disabled={verificationLoading === acc.apiKeyMasked || activationLoading === acc.apiKeyMasked}
                        onClick={() => onVerifyKey(acc.provider, acc.apiKeyMasked)}
                      >
                        {verificationLoading === acc.apiKeyMasked ? "Memverifikasi..." : "Verifikasi"}
                      </Button>
                      {!isActive && (
                        <Button
                          variant="ghost"
                          className="text-xs hover:text-[var(--accent)] px-2.5 py-1 h-auto"
                          disabled={activationLoading === acc.apiKeyMasked || verificationLoading === acc.apiKeyMasked}
                          onClick={() => onActivateKey(acc.provider, acc.apiKeyMasked)}
                        >
                          {activationLoading === acc.apiKeyMasked ? "Mengaktifkan..." : "Aktifkan"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="col-span-2 border-dashed border-[var(--border)] bg-[var(--surface-muted)] py-10 flex flex-col items-center justify-center text-center">
            <Key size={36} className="text-[var(--text-subtle)] mb-3" />
            <div className="text-sm font-semibold text-[var(--text-muted)]">Belum Ada API KEY Terdaftar</div>
            <p className="text-xs text-[var(--text-subtle)] max-w-sm mt-1 leading-relaxed">
              Silakan daftarkan API KEY baru menggunakan tombol di atas untuk memulai.
            </p>
          </Card>
        )}

        {loading ? apifyPlaceholderSkeleton : (
          <Card className="border-[var(--border-soft)] bg-[var(--surface-muted)] opacity-75 relative overflow-hidden">
            <div className="absolute right-3 top-3">
              <span className="inline-flex items-center rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-xxs font-medium text-[var(--text-subtle)]">
                Future Plan
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--text-subtle)]">
                  <Server size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--text-muted)]">Apify Scraper Integration</div>
                  <div className="text-xs text-[var(--text-subtle)] font-mono">Status: Standby</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[var(--text-subtle)]">
                  <span>Estimasi Saldo Kuota</span>
                  <span>$5.00 / $5.00 Free Trial</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                  <div className="h-full bg-[var(--border)] rounded-full" style={{ width: "100%" }} />
                </div>
              </div>

              <p className="text-xs text-[var(--text-subtle)] italic pt-1 leading-relaxed">
                * Registrasi token Apify melalui tombol di atas akan memicu failover hybrid secara otomatis di masa mendatang.
              </p>
            </div>
          </Card>
        )}
      </div>

      {!loading && apiAccountsList.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-1 border-[var(--border-soft)] bg-[var(--surface-muted)] flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-sm font-semibold mb-4 text-[var(--text-muted)] w-full text-left">Konsolidasi Kuota</h3>

            <div className="relative flex items-center justify-center h-36 w-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className="text-[color-mix(in_srgb,var(--surface-strong)_60%,transparent)]"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="50"
                  className="text-[var(--accent)]"
                  strokeWidth="10"
                  strokeDasharray={314.16}
                  initial={{ strokeDashoffset: 314.16 }}
                  animate={{ strokeDashoffset: 314.16 - (314.16 * overallPct) / 100 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-[var(--text)]">{overallPct}%</span>
                <span className="text-[10px] text-[var(--text-subtle)] uppercase tracking-wider">Tersedia</span>
              </div>
            </div>

            <div className="mt-4 flex gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[var(--accent)]" />
                <span className="text-[var(--text-subtle)]">Sisa: {totalRemaining}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-indigo-500 opacity-60" />
                <span className="text-[var(--text-subtle)]">Terpakai: {totalUsed}</span>
              </div>
            </div>
          </Card>

          <Card className="md:col-span-2 border-[var(--border-soft)] bg-[var(--surface-muted)] p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold mb-4 text-[var(--text-muted)]">Perbandingan Pemakaian API KEY</h3>

              <div className="space-y-4 overflow-y-auto max-h-[160px] pr-2">
                {apiAccountsList.map((acc: any) => {
                  const usage = apiUsageList.find((u: any) => u.key === acc.apiKeyMasked);
                  const limit = usage?.limit ?? 100;
                  const remaining = usage?.remaining ?? 100;
                  const used = limit - remaining;
                  const pct = limit === 0 ? 0 : Math.round((remaining / limit) * 100);

                  return (
                    <div key={acc.id} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-[var(--text-muted)] truncate max-w-[200px]" title={acc.accountName}>
                          {acc.accountName} <span className="font-mono text-[10px] text-[var(--text-subtle)] font-normal">({acc.apiKeyMasked})</span>
                        </span>
                        <span className="text-[var(--text-subtle)] font-medium">
                          {remaining} / {limit} Requests ({pct}%)
                        </span>
                      </div>

                      <div className="h-3.5 w-full rounded-full bg-[var(--surface)] overflow-hidden flex border border-[var(--border-soft)] relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(used / limit) * 100}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full bg-gradient-to-r from-indigo-500/80 to-rose-400/80"
                        />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(remaining / limit) * 100}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full bg-[var(--accent)]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-xxs text-[var(--text-subtle)] mt-2 italic">
              * Grafik batang di atas membandingkan jumlah kuota terpakai (ungu/merah) vs tersisa (biru) untuk masing-masing kredensial API.
            </p>
          </Card>
        </div>
      )}
    </>
  );
}
