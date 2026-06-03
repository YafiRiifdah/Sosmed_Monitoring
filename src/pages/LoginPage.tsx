import { useState } from "react";
import { BarChart3, Key, Lock, User, Eye, EyeOff, ShieldAlert, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../services/api";
import type { User as UserType } from "../types";
import { Input } from "../components/ui/input";
import { ThemeToggle } from "../components/ThemeToggle";

export function LoginPage({ onLoginSuccess }: { onLoginSuccess: (user: UserType) => void }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await api.login({ identifier, password });
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message ?? "Kredensial tidak valid. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell relative flex min-h-screen items-center justify-center px-4 py-12 font-sans">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle compact />
      </div>

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] backdrop-blur-xl lg:grid-cols-[1fr_420px]">
        <section className="hidden min-h-[560px] border-r border-[var(--border-soft)] bg-[var(--surface-muted)] p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)]">
              <BarChart3 size={24} />
            </div>
            <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight text-[var(--text)]">
              Monitoring engagement Instagram untuk tim admin.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-[var(--text-subtle)]">
              Pantau target, akun wajib PAC, status engagement, dan ranking dari satu dashboard yang lebih tenang untuk dipakai harian.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Like", "+1"],
              ["Comment", "+3"],
              ["Status", "Live"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-subtle)]">{label}</div>
                <div className="mt-2 text-xl font-semibold text-[var(--text)]">{value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 sm:p-8">
          {/* Logo and Brand Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="mb-8 text-center lg:text-left"
        >
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 10 }}
            className="mx-auto mb-3 flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl bg-[var(--accent)] lg:mx-0"
          >
            <Key className="text-[var(--accent-contrast)] font-bold" size={24} />
          </motion.div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text)]">Engage Monitor</h2>
          <p className="mt-2 text-sm text-[var(--text-subtle)]">Masukkan kredensial admin untuk memantau aktivitas.</p>
        </motion.div>

        {/* Glassmorphism Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.1 }}
          className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-strong)] p-5 backdrop-blur-xl sm:p-6"
        >
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-start gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-300 overflow-hidden"
              >
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Email / Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
                Username / Email
              </label>
              <Input
                type="text"
                required
                placeholder="Masukkan username atau email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                icon={<User size={18} />}
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
                Password
              </label>
              <Input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={18} />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[var(--text-subtle)] hover:text-[var(--text)] transition-colors focus:outline-none flex items-center"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={loading ? undefined : { scale: 1.01 }}
              whileTap={loading ? undefined : { scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="group relative flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] py-3 text-sm font-bold text-[var(--accent-contrast)] transition-all hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--accent-contrast)] border-t-transparent" />
              ) : (
                <>
                  Masuk Dashboard
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </motion.button>

          </form>
        </motion.div>

        {/* Footer Security Notice */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-xs text-[var(--text-subtle)]"
        >
          Sistem Keamanan Terenkripsi. Akses dibatasi khusus untuk admin terdaftar.
        </motion.p>
        </section>
      </div>
    </div>
  );
}
