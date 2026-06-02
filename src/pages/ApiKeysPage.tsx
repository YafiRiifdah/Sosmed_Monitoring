import { useCallback, useState } from "react";
import { Calendar, Key, RefreshCw, Zap, Layers, Server, Shield, Sparkles, Mail, Lock, User, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/Button";
import { CustomSelect } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Dialog } from "../components/ui/dialog";
import { Card } from "../components/Card";
import { Skeleton } from "../components/Skeleton";
import { api } from "../services/api";
import { useAsync } from "../hooks/useAsync";

export function ApiKeysPage() {
  const { data, loading, error, reload } = useAsync(useCallback(() => api.overview(), []));

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [provider, setProvider] = useState<"rapidapi" | "apify">("rapidapi");
  const [accountName, setAccountName] = useState("");
  const [email, setEmail] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [notes, setNotes] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const apiUsageList = data?.apiUsage ?? [];

  async function handleRegisterKey(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setFormLoading(true);

    try {
      await api.addApiKey({ provider, accountName, email, apiKey, notes });
      setFormSuccess(`Kunci API ${provider === "rapidapi" ? "RapidAPI" : "Apify"} berhasil disimpan secara aman!`);
      
      // Clear inputs
      setAccountName("");
      setEmail("");
      setApiKey("");
      setNotes("");
      
      // Reload quota list
      await reload();

      // Close modal after a short delay so the user sees the success state
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(null);
      }, 1500);

    } catch (err: any) {
      setFormError(err.message ?? "Gagal menyimpan kunci API.");
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="space-y-6 font-sans text-[var(--text-muted)]">
      {/* Header Section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text)] tracking-wide">API Quota Monitor</h1>
          <p className="text-sm text-[var(--text-subtle)]">
            Pantau sisa kuota credit dan masa aktif dari seluruh akun RapidAPI dan Apify secara terpusat.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            icon={<RefreshCw className={loading ? "animate-spin" : ""} size={16} />}
            onClick={() => void reload()}
          >
            Refresh Quota
          </Button>
          <Button
            icon={<Plus size={16} />}
            onClick={() => {
              setFormError(null);
              setFormSuccess(null);
              setIsModalOpen(true);
            }}
          >
            Register Key
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Main Quotas Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {loading ? (
          <Skeleton variant="card" count={2} />
        ) : apiUsageList.length > 0 ? (
          apiUsageList.map((usage) => {
            const pct = usage.limit === 0 ? 0 : Math.round((usage.remaining / usage.limit) * 100);
            const isExhausted = usage.remaining === 0;
            const isLow = usage.remaining > 0 && usage.remaining < 20;

            return (
              <Card key={usage.key} className="relative overflow-hidden border-[var(--border-soft)] hover:border-sky-500/20 transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-sky-400">
                        <Key size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-muted)]">
                          {usage.key.startsWith("apif") ? "Apify Token" : "RapidAPI Key"}
                        </div>
                        <div className="text-xs text-[var(--text-subtle)] font-mono tracking-tight">{usage.key}</div>
                      </div>
                    </div>
                    <div>
                      {isExhausted ? (
                        <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-400 border border-rose-500/20">
                          Exhausted
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
                          Low Limit
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-400 border border-sky-500/20">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-[var(--text-subtle)]">
                      <span>Available Credits</span>
                      <span className="font-semibold text-[var(--text-muted)]">
                        {usage.remaining} / {usage.limit} Requests
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-muted)] p-[1px] border border-[var(--border-soft)]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isExhausted 
                            ? "bg-rose-400" 
                            : isLow 
                            ? "bg-amber-400" 
                            : "bg-sky-400"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 pt-3 border-t border-[var(--border-soft)] text-xs text-[var(--text-subtle)]">
                    {usage.resetAt && (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-[var(--text-subtle)]" />
                        <span>Reset: {new Date(usage.resetAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Zap size={14} className="text-[var(--text-subtle)]" />
                      <span>Sync: {new Date(usage.updatedAt).toLocaleTimeString("id-ID")}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="col-span-2 border-dashed border-[var(--border)] bg-[var(--surface-muted)] py-10 flex flex-col items-center justify-center text-center">
            <Key size={36} className="text-[var(--text-subtle)] mb-3" />
            <div className="text-sm font-semibold text-[var(--text-muted)]">Belum Ada Riwayat Penggunaan API</div>
            <p className="text-xs text-[var(--text-subtle)] max-w-sm mt-1 leading-relaxed">
              Data pemakaian akan otomatis terekam setelah Anda memicu proses "Fetch" atau "Discover" postingan, atau setelah Anda mendaftarkan Key baru dengan tombol di atas.
            </p>
          </Card>
        )}

        {/* Apify Placeholder Widget */}
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
      </div>

      {/* Multi-Account & Scale Roadmap Tutorial Card */}
      <div className="pt-4">
        <h2 className="text-lg font-semibold mb-4 text-[var(--text)] flex items-center gap-2 tracking-wide">
          <Sparkles className="text-sky-400" size={19} />
          Panduan Skalabilitas: Ternak Banyak Akun & Rotasi API
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-[var(--border-soft)] bg-[var(--surface-muted)] hover:border-sky-500/20 transition-all duration-300">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-sky-400">
                <Layers size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-muted)]">1. Rotasi API Key (RapidAPI)</h3>
                <p className="text-xs text-[var(--text-subtle)] mt-1.5 leading-relaxed">
                  Anda dapat mendaftarkan banyak akun gratisan dengan tombol di atas. Backend secara otomatis merekam kredensial aslinya ke dalam file database terenkripsi yang aman dari kebocoran Git.
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-[var(--border-soft)] bg-[var(--surface-muted)] hover:border-blue-500/20 transition-all duration-300">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-blue-400">
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

          <Card className="border-[var(--border-soft)] bg-[var(--surface-muted)] hover:border-sky-500/20 transition-all duration-300">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-sky-400">
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

      {/* ========================================================================= */}
      {/* GORGEOUS FROSTED GLASS MODAL OVERLAY */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Daftarkan API Key Baru"
        icon={<Key size={16} />}
      >
        <form onSubmit={(e) => void handleRegisterKey(e)} className="space-y-4">
          {formError && (
            <div className="rounded-md border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="rounded-md border border-sky-500/20 bg-sky-500/10 p-3 text-xs text-sky-300 flex items-center gap-1.5">
              <Shield size={14} className="shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}
          
          {/* Provider Select */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
              Penyedia (Provider)
            </label>
            <CustomSelect
              value={provider}
              onChange={(val) => setProvider(val as "rapidapi" | "apify")}
              options={[
                { value: "rapidapi", label: "RapidAPI Key" },
                { value: "apify", label: "Apify Token" }
              ]}
              placeholder="Pilih provider"
              className="w-full"
            />
          </div>

          {/* Account Name Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
              Nama Identitas Akun
            </label>
            <Input
              type="text"
              required
              placeholder="Contoh: RapidAPI Yafi 03"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              icon={<User size={16} />}
            />
          </div>

          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
              Email Terdaftar Akun
            </label>
            <Input
              type="email"
              required
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={16} />}
            />
          </div>

          {/* API Key Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
              Kunci API (API Key / Token Rahasia)
            </label>
            <Input
              type="password"
              required
              placeholder="Masukkan Kunci API asli"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              icon={<Lock size={16} />}
            />
          </div>

          {/* Notes Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
              Catatan (Opsional)
            </label>
            <Input
              type="text"
              placeholder="Reset kuota: Tanggal 15"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[var(--text-subtle)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] rounded-md transition-colors"
            >
              Batal
            </button>
            <Button type="submit" disabled={formLoading}>
              {formLoading ? "Menyimpan..." : "Simpan Kunci"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
