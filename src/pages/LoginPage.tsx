import { useState } from "react";
import { Key, Lock, User, Eye, EyeOff, ShieldAlert, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../services/api";
import type { User as UserType } from "../types";

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
    <div className="relative flex min-h-screen items-center justify-center bg-[#090d16] px-4 py-12 overflow-hidden font-sans">
      {/* Background Decorative Glowing Orbs */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute -left-20 -top-20 h-[350px] w-[350px] rounded-full bg-teal-500/10 blur-[80px]" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.2 }}
        className="absolute -right-20 -bottom-20 h-[350px] w-[350px] rounded-full bg-indigo-500/10 blur-[80px]" 
      />

      <div className="relative w-full max-w-md">
        {/* Logo and Brand Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="mb-8 text-center"
        >
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 10 }}
            className="mx-auto mb-3 flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-tr from-teal-400 to-indigo-500 shadow-[0_0_20px_rgba(20,184,166,0.3)]"
          >
            <Key className="text-white" size={24} />
          </motion.div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Engage Monitor</h2>
          <p className="mt-2 text-sm text-slate-400">Masukkan kredensial admin untuk memantau aktivitas.</p>
        </motion.div>

        {/* Glassmorphism Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl"
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
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Username / Email
              </label>
              <div className="relative rounded-lg bg-black/20 focus-within:ring-2 focus-within:ring-teal-500/50 transition-all">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Masukkan username atau email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-lg border-0 bg-transparent py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <div className="relative rounded-lg bg-black/20 focus-within:ring-2 focus-within:ring-teal-500/50 transition-all">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border-0 bg-transparent py-3 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={loading ? undefined : { scale: 1.01 }}
              whileTap={loading ? undefined : { scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="group relative flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-indigo-500 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition-all hover:brightness-110 disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-xs text-slate-600"
        >
          Sistem Keamanan Terenkripsi. Akses dibatasi khusus untuk admin terdaftar.
        </motion.p>
      </div>
    </div>
  );
}

