import { useState, type ReactNode } from "react";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Lock,
  ShieldAlert,
  CheckCircle,
  Save,
  KeyRound,
  BadgeCheck,
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { api } from "../services/api";
import type { User as UserType } from "../types";
import { UiCard } from "../components/ui/card";
import { UiButton } from "../components/ui/button";
import { Input } from "../components/ui/input";

interface Props {
  currentUser: UserType;
  onUserUpdate: (updatedUser: UserType) => void;
}

const pageVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
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
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function SettingsPage({ currentUser, onUserUpdate }: Props) {
  const [username, setUsername] = useState(currentUser.username);
  const [email, setEmail] = useState(currentUser.email);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setProfileLoading(true);

    try {
      const updatedUser = await api.updateProfile({ username, email });
      onUserUpdate(updatedUser);
      setProfileSuccess("Profil berhasil diperbarui.");
    } catch (err: any) {
      setProfileError(err.message ?? "Gagal memperbarui profil.");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi password baru tidak cocok.");
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await api.changePassword({ oldPassword, newPassword });
      setPasswordSuccess(response.message || "Kata sandi berhasil diperbarui.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message ?? "Gagal mengubah kata sandi.");
    } finally {
      setPasswordLoading(false);
    }
  }

  const formattedDate = new Date(
    currentUser.createdAt || Date.now()
  ).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const roleLabel = currentUser.role.toLowerCase().replace("_", " ");
  const initial = currentUser.username?.charAt(0)?.toUpperCase() ?? "A";

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 text-[var(--text-muted)]"
    >
      <motion.div variants={itemVariants}>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--accent-ring)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
          <Shield size={13} />
          Account Settings
        </div>

        <h1 className="text-2xl font-semibold tracking-wide text-[var(--text)]">
          Pengaturan Akun
        </h1>

        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--text-subtle)]">
          Perbarui informasi profil dan keamanan akun admin Anda.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <motion.div variants={itemVariants} className="space-y-6">
          <UiCard className="overflow-hidden border-[var(--border-soft)] bg-[var(--surface)] p-0">
            <div className="relative border-b border-[var(--border-soft)] bg-[var(--surface-muted)] p-6">
              <div className="absolute right-4 top-4 rounded-full border border-[var(--accent-ring)] bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">
                Active
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--accent)] text-3xl font-bold uppercase text-[var(--accent-contrast)] shadow-lg shadow-black/10">
                  {initial}
                </div>

                <h3 className="mt-4 text-lg font-bold text-[var(--text)]">
                  @{currentUser.username}
                </h3>

                <p className="mt-1 max-w-full truncate text-xs text-[var(--text-subtle)]">
                  {currentUser.email}
                </p>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <InfoItem
                icon={<Shield size={16} />}
                label="Peran Sistem"
                value={roleLabel}
              />

              <InfoItem
                icon={<Calendar size={16} />}
                label="Bergabung Pada"
                value={formattedDate}
              />

              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-4">
                <div className="flex items-start gap-3">
                  <BadgeCheck
                    size={17}
                    className="mt-0.5 shrink-0 text-[var(--accent)]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)]">
                      Akun Terverifikasi
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-subtle)]">
                      Akun ini memiliki akses ke dashboard monitoring sesuai
                      role yang diberikan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </UiCard>
        </motion.div>

        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <SettingsCard
              icon={<User size={18} />}
              title="Informasi Profil"
              description="Ubah username dan email yang digunakan untuk login."
            >
              <form
                onSubmit={(e) => void handleProfileSubmit(e)}
                className="space-y-5"
              >
                <MessageBox error={profileError} success={profileSuccess} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Username">
                    <Input
                      type="text"
                      required
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      icon={<User size={16} />}
                    />
                  </Field>

                  <Field label="Email">
                    <Input
                      type="email"
                      required
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      icon={<Mail size={16} />}
                    />
                  </Field>
                </div>

                <div className="flex justify-end pt-1">
                  <UiButton type="submit" disabled={profileLoading}>
                    <Save size={15} />
                    {profileLoading ? "Menyimpan..." : "Simpan Profil"}
                  </UiButton>
                </div>
              </form>
            </SettingsCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <SettingsCard
              icon={<KeyRound size={18} />}
              title="Keamanan Akun"
              description="Perbarui kata sandi secara berkala untuk menjaga akses tetap aman."
            >
              <form
                onSubmit={(e) => void handlePasswordSubmit(e)}
                className="space-y-5"
              >
                <MessageBox error={passwordError} success={passwordSuccess} />

                <Field label="Kata Sandi Lama">
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    icon={<Lock size={16} />}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Kata Sandi Baru">
                    <Input
                      type="password"
                      required
                      placeholder="Min. 6 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      icon={<Lock size={16} />}
                    />
                  </Field>

                  <Field label="Konfirmasi Kata Sandi">
                    <Input
                      type="password"
                      required
                      placeholder="Ulangi password baru"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      icon={<Lock size={16} />}
                    />
                  </Field>
                </div>

                <div className="flex justify-end pt-1">
                  <UiButton type="submit" disabled={passwordLoading}>
                    <Lock size={15} />
                    {passwordLoading ? "Memperbarui..." : "Ubah Kata Sandi"}
                  </UiButton>
                </div>
              </form>
            </SettingsCard>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function SettingsCard({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <UiCard className="overflow-hidden border-[var(--border-soft)] bg-[var(--surface)] p-0">
      <div className="border-b border-[var(--border-soft)] bg-[var(--surface-muted)] p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            {icon}
          </div>

          <div>
            <h2 className="font-semibold text-[var(--text)]">{title}</h2>
            <p className="mt-1 text-xs leading-5 text-[var(--text-subtle)]">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">{children}</div>
    </UiCard>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
        {icon}
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-semibold capitalize text-[var(--text)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
        {label}
      </label>
      {children}
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
          className="flex items-start gap-2.5 rounded-xl border border-[color-mix(in_srgb,var(--danger)_22%,transparent)] bg-[var(--danger-soft)] p-3 text-xs text-[var(--danger)]"
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
          className="flex items-start gap-2.5 rounded-xl border border-[var(--accent-ring)] bg-[var(--accent-soft)] p-3 text-xs text-[var(--accent)]"
        >
          <CheckCircle size={16} className="mt-0.5 shrink-0" />
          <span>{success}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}