import { useCallback, useState } from "react";
import { Calendar, Key, RefreshCw, Zap, Layers, Server, Shield, Sparkles, Mail, Lock, User, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/Button";
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
    <div className="space-y-6 font-sans">
      {/* Header Section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">API Quota Monitor</h1>
          <p className="text-sm text-slate-500">
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
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
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
              <Card key={usage.key} className="relative overflow-hidden border-teal-100 hover:border-teal-300 transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-50 text-teal-700">
                        <Key size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">
                          {usage.key.startsWith("apif") ? "Apify Token" : "RapidAPI Key"}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">{usage.key}</div>
                      </div>
                    </div>
                    <div>
                      {isExhausted ? (
                        <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/10">
                          Exhausted
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/10">
                          Low Limit
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                      <span>Available Credits</span>
                      <span className="font-semibold text-slate-800">
                        {usage.remaining} / {usage.limit} Requests
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-md bg-slate-100">
                      <div
                        className={`h-full transition-all duration-500 ${isExhausted ? "bg-rose-500" : isLow ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    {usage.resetAt && (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        <span>Reset: {new Date(usage.resetAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Zap size={14} className="text-slate-400" />
                      <span>Sync: {new Date(usage.updatedAt).toLocaleTimeString("id-ID")}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="col-span-2 border-dashed border-slate-300 py-10 flex flex-col items-center justify-center text-center">
            <Key size={36} className="text-slate-300 mb-3" />
            <div className="text-sm font-semibold text-slate-700">Belum Ada Riwayat Penggunaan API</div>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Data pemakaian akan otomatis terekam setelah Anda memicu proses "Fetch" atau "Discover" postingan, atau setelah Anda mendaftarkan Key baru dengan tombol di atas.
            </p>
          </Card>
        )}

        {/* Apify Placeholder Widget */}
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 opacity-80 relative overflow-hidden">
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-xxs font-medium text-slate-600">
              Future Plan
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-200 text-slate-500">
                <Server size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-700">Apify Scraper Integration</div>
                <div className="text-xs text-slate-400 font-mono">Status: Standby</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Estimasi Saldo Kuota</span>
                <span>$5.00 / $5.00 Free Trial</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-md bg-slate-200">
                <div className="h-full bg-slate-400" style={{ width: "100%" }} />
              </div>
            </div>

            <p className="text-xs text-slate-500 italic pt-1">
              * Registrasi token Apify melalui tombol di atas akan memicu failover hybrid secara otomatis di masa mendatang.
            </p>
          </div>
        </Card>
      </div>

      {/* Multi-Account & Scale Roadmap Tutorial Card */}
      <div className="pt-4">
        <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
          <Sparkles className="text-amber-500" size={19} />
          Panduan Skalabilitas: Ternak Banyak Akun & Rotasi API
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-teal-50 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-600">
                <Layers size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">1. Rotasi API Key (RapidAPI)</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Anda dapat mendaftarkan banyak akun gratisan dengan tombol di atas. Backend secara otomatis merekam kredensial aslinya ke dalam file database terenkripsi yang aman dari kebocoran Git.
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-indigo-50 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
                <Server size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">2. Hybrid Rantai 3-Tingkat</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Gabungkan **RapidAPI** (prioritas utama) + **Apify** (cadangan token gratis) + **Playwright Local** (fallback otomatis gratis selamanya). Menjamin kelancaran scraping tanpa downtime dengan pengeluaran Rp0.
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-amber-50 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-600">
                <Shield size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">3. Dashboard Terkonsolidasi</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
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
      {/* ========================================================================= */}
      {/* GORGEOUS FROSTED GLASS MODAL OVERLAY */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            >
              
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none"
              >
                <X size={18} />
              </button>

              {/* Modal Title */}
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-50 text-teal-600">
                  <Key size={16} />
                </div>
                <h2 className="text-base font-bold text-slate-800">Daftarkan API Key Baru</h2>
              </div>

              {/* Form */}
              <form onSubmit={(e) => void handleRegisterKey(e)} className="space-y-4">
                {formError && (
                  <div className="rounded-md bg-rose-50 border border-rose-100 p-3 text-xs text-rose-700">
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="rounded-md bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-700 flex items-center gap-1.5">
                    <Shield size={14} className="shrink-0" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                {/* Provider Select */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Penyedia (Provider)
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as "rapidapi" | "apify")}
                    className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-800 focus:outline-none focus:border-teal-400"
                  >
                    <option value="rapidapi">RapidAPI Key</option>
                    <option value="apify">Apify Token</option>
                  </select>
                </div>

                {/* Account Name Input */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Nama Identitas Akun
                  </label>
                  <div className="relative rounded-md bg-slate-50 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:bg-white transition-all">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: RapidAPI Yafi 03"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-transparent py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Email Terdaftar Akun
                  </label>
                  <div className="relative rounded-md bg-slate-50 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:bg-white transition-all">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-transparent py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>

                {/* API Key Input */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Kunci API (API Key / Token Rahasia)
                  </label>
                  <div className="relative rounded-md bg-slate-50 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:bg-white transition-all">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="Masukkan Kunci API asli"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-transparent py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>

                {/* Notes Input */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Catatan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Reset kuota: Tanggal 15"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    Batal
                  </button>
                  <Button type="submit" disabled={formLoading}>
                    {formLoading ? "Menyimpan..." : "Simpan Kunci"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
