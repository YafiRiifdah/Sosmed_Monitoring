import { useState } from "react";
import {
  BarChart3,
  Key,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldAlert,
  ArrowRight,
  Mail,
  FileCode2,
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { api } from "../services/api";
import type { User as UserType } from "../types";
import { Input } from "../components/ui/input";
import { ThemeToggle } from "../components/ThemeToggle";

type ViewMode = "login" | "forgot" | "reset";

const pageVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const viewVariants: Variants = {
  hidden: { opacity: 0, x: 18, filter: "blur(6px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    x: -18,
    filter: "blur(6px)",
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function LoginPage({
  onLoginSuccess,
}: {
  onLoginSuccess: (user: UserType) => void;
}) {
  const [view, setView] = useState<ViewMode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [resetEmail, setResetEmail] = useState("");
  const [devToken, setDevToken] = useState<string | null>(null);

  const [tokenInput, setTokenInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  function clearMessage() {
    setError(null);
    setSuccess(null);
  }

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearMessage();
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

  async function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearMessage();
    setLoading(true);

    try {
      const response = await api.forgotPassword({ email: resetEmail });
      setSuccess(response.message);

      if (response.devToken) {
        setDevToken(response.devToken);
        setTokenInput(response.devToken);
      }

      setView("reset");
    } catch (err: any) {
      setError(err.message ?? "Gagal memproses permintaan reset password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearMessage();

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.resetPassword({
        email: resetEmail,
        token: tokenInput,
        newPassword,
      });

      setSuccess(response.message);
      setDevToken(null);
      setPassword("");
      setTokenInput("");
      setNewPassword("");
      setConfirmPassword("");
      setView("login");
    } catch (err: any) {
      setError(err.message ?? "Gagal mereset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 font-sans">
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle compact />
      </div>

      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] shadow-2xl shadow-black/10 backdrop-blur-xl lg:grid-cols-[1.05fr_420px]"
      >
        <section className="relative hidden min-h-[590px] overflow-hidden border-r border-[var(--border-soft)] bg-[var(--surface-muted)] p-8 lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[var(--accent-soft)] blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[var(--accent-soft)] opacity-60 blur-3xl" />

          <motion.div variants={itemVariants} className="relative">
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--accent-contrast)] shadow-lg shadow-black/10">
              <BarChart3 size={24} />
            </div>

            <p className="mb-3 inline-flex rounded-full border border-[var(--accent-ring)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
              Admin Dashboard
            </p>

            <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight text-[var(--text)]">
              Dashboard Monitoring Engagement.
            </h1>

            <p className="mt-4 max-w-md text-sm leading-6 text-[var(--text-subtle)]">
              Pantau akun target, status engagement, dan performa admin dalam
              satu dashboard yang bersih dan mudah dibaca.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="relative space-y-4">
            <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <ShieldCheck size={19} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">
                    Secure Access
                  </p>
                  <p className="text-xs text-[var(--text-subtle)]">
                    Akses terbatas untuk admin terdaftar.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                ["Like", "+1"],
                ["Comment", "+3"],
                ["Status", "Live"],
              ].map(([label, value]) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -3 }}
                  className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                    {label}
                  </div>
                  <div className="mt-2 text-xl font-semibold text-[var(--text)]">
                    {value}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {view === "login" && (
              <motion.div
                key="login-view"
                variants={viewVariants}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <div className="mb-7 text-center lg:text-left">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--accent-contrast)] lg:mx-0">
                    <Key size={23} />
                  </div>

                  <h2 className="text-3xl font-bold tracking-tight text-[var(--text)]">
                    Welcome Back
                  </h2>

                  <p className="mt-2 text-sm text-[var(--text-subtle)]">
                    Masuk untuk melanjutkan ke dashboard monitoring.
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-strong)] p-5 backdrop-blur-xl sm:p-6">
                  <form
                    onSubmit={(e) => void handleLoginSubmit(e)}
                    className="space-y-5"
                  >
                    <MessageBox error={error} success={success} />

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

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
                          Password
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            clearMessage();
                            setView("forgot");
                          }}
                          className="text-xs font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
                        >
                          Lupa password?
                        </button>
                      </div>

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
                            className="flex items-center text-[var(--text-subtle)] transition-colors hover:text-[var(--text)]"
                          >
                            {showPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        }
                      />
                    </div>

                    <SubmitButton loading={loading}>
                      Masuk Dashboard
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </SubmitButton>
                  </form>
                </div>
              </motion.div>
            )}

            {view === "forgot" && (
              <motion.div
                key="forgot-view"
                variants={viewVariants}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <FormHeader
                  title="Lupa Password"
                  description="Masukkan email akun admin untuk menerima token reset."
                  backLabel="Kembali ke login"
                  onBack={() => {
                    clearMessage();
                    setView("login");
                  }}
                />

                <FormCard>
                  <form
                    onSubmit={(e) => void handleForgotSubmit(e)}
                    className="space-y-5"
                  >
                    <MessageBox error={error} success={null} />

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
                        Email Admin
                      </label>
                      <Input
                        type="email"
                        required
                        placeholder="admin@example.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        icon={<Mail size={18} />}
                      />
                    </div>

                    <SubmitButton loading={loading}>Kirim Kode Reset</SubmitButton>
                  </form>
                </FormCard>
              </motion.div>
            )}

            {view === "reset" && (
              <motion.div
                key="reset-view"
                variants={viewVariants}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <FormHeader
                  title="Reset Password"
                  description="Masukkan token reset dan password baru."
                  backLabel="Ganti email"
                  onBack={() => {
                    clearMessage();
                    setDevToken(null);
                    setView("forgot");
                  }}
                />

                <div className="space-y-4">
                  {devToken && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-[var(--warning-soft)] bg-[var(--warning-soft)] p-4 text-xs text-[var(--warning)]"
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <FileCode2 size={15} />
                        Mode Developer
                      </div>
                      <p className="mt-1 leading-5">
                        Token reset:
                        <span className="ml-1 rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-2 py-0.5 font-mono text-sm font-bold">
                          {devToken}
                        </span>
                      </p>
                    </motion.div>
                  )}

                  <FormCard>
                    <form
                      onSubmit={(e) => void handleResetSubmit(e)}
                      className="space-y-5"
                    >
                      <MessageBox error={error} success={null} />

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
                          Token Reset
                        </label>
                        <Input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="123456"
                          value={tokenInput}
                          onChange={(e) => setTokenInput(e.target.value)}
                          icon={<Key size={18} />}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
                          Password Baru
                        </label>
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          required
                          placeholder="Min. 6 karakter"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          icon={<Lock size={18} />}
                          rightElement={
                            <button
                              type="button"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                              className="flex items-center text-[var(--text-subtle)] transition-colors hover:text-[var(--text)]"
                            >
                              {showNewPassword ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </button>
                          }
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
                          Konfirmasi Password
                        </label>
                        <Input
                          type="password"
                          required
                          placeholder="Ulangi password baru"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          icon={<Lock size={18} />}
                        />
                      </div>

                      <SubmitButton loading={loading}>
                        Atur Ulang Password
                      </SubmitButton>
                    </form>
                  </FormCard>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.p
            variants={itemVariants}
            className="mt-7 text-center text-xs text-[var(--text-subtle)]"
          >
            Sistem keamanan terenkripsi. Akses khusus admin terdaftar.
          </motion.p>
        </section>
      </motion.div>
    </main>
  );
}

function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-strong)] p-5 backdrop-blur-xl sm:p-6">
      {children}
    </div>
  );
}

function FormHeader({
  title,
  description,
  backLabel,
  onBack,
}: {
  title: string;
  description: string;
  backLabel: string;
  onBack: () => void;
}) {
  return (
    <div className="mb-7 text-center lg:text-left">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-subtle)] transition-colors hover:text-[var(--text)]"
      >
        <ArrowLeft size={14} />
        {backLabel}
      </button>

      <h2 className="text-3xl font-bold tracking-tight text-[var(--text)]">
        {title}
      </h2>

      <p className="mt-2 text-sm text-[var(--text-subtle)]">{description}</p>
    </div>
  );
}

function MessageBox({
  error,
  success,
}: {
  error: string | null;
  success: string | null;
}) {
  return (
    <AnimatePresence mode="wait">
      {error && (
        <motion.div
          key="error"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="flex items-start gap-2.5 rounded-xl border border-[color-mix(in_srgb,var(--danger)_22%,transparent)] bg-[var(--danger-soft)] p-3.5 text-xs text-[var(--danger)]"
        >
          <ShieldAlert size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="flex items-start gap-2.5 rounded-xl border border-[var(--accent-ring)] bg-[var(--accent-soft)] p-3.5 text-xs text-[var(--accent)]"
        >
          <CheckCircle size={16} className="mt-0.5 shrink-0" />
          <span>{success}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SubmitButton({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-3 text-sm font-bold text-[var(--accent-contrast)] transition-all hover:bg-[var(--accent-hover)] disabled:pointer-events-none disabled:opacity-50"
    >
      {loading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--accent-contrast)] border-t-transparent" />
      ) : (
        children
      )}
    </motion.button>
  );
}