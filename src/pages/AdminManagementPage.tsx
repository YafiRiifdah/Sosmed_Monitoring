import { useCallback, useState } from "react";
import { UserPlus, Shield, Mail, Lock, User, Trash2, Calendar, CheckCircle2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Transition, Variants } from "framer-motion";
import { AnimatedModalContent } from "../components/AnimatedModalContent";
import { Button } from "../components/Button";
import { Input } from "../components/ui/input";
import { Dialog } from "../components/ui/dialog";
import { Card } from "../components/Card";
import { api } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import type { User as UserType } from "../types";

// Kurva transisi premium (ultra-smooth easing) untuk semua komponen
const smoothTransition: Transition = {
  type: "tween",
  ease: [0.16, 1, 0.3, 1], // Kurva kustom untuk akselerasi melambat yang sangat elegan
  duration: 0.55,
};

// Variasi animasi stagger untuk pembungkus data list
const tableContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

// Variasi animasi untuk baris data individual (Sangat Lembut & Clean)
const rowVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 12, 
    scale: 0.98,
    filter: "blur(4px)" 
  },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    filter: "blur(0px)",
    transition: smoothTransition
  },
  exit: { 
    opacity: 0, 
    x: -10, 
    filter: "blur(2px)",
    transition: { duration: 0.22, ease: "easeOut" } 
  },
};

export function AdminManagementPage({ currentUser }: { currentUser: UserType }) {
  const { data: users, loading, error, reload } = useAsync(useCallback(() => api.adminListUsers(), []));

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Deleting State
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<UserType | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const adminListSkeleton = (
    <div className="divide-y divide-[var(--border-soft)]">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-1 gap-3 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-4 md:grid-cols-12 md:gap-4 md:rounded-none md:border-none md:px-6"
        >
          <div className="space-y-2 md:col-span-5">
            <div className="animate-shimmer h-4 w-36 rounded bg-[var(--surface-muted)]" />
            <div className="animate-shimmer h-3 w-48 max-w-full rounded bg-[var(--surface-muted)]" />
          </div>

          <div className="flex items-center gap-2 md:col-span-3">
            <div className="block h-3 w-10 md:hidden">
              <div className="animate-shimmer h-3 w-10 rounded bg-[var(--surface-muted)]" />
            </div>
            <div className="animate-shimmer h-7 w-28 rounded-full bg-[var(--surface-muted)]" />
          </div>

          <div className="flex items-center gap-2 md:col-span-3">
            <div className="block h-3 w-12 md:hidden">
              <div className="animate-shimmer h-3 w-12 rounded bg-[var(--surface-muted)]" />
            </div>
            <div className="animate-shimmer h-4 w-32 rounded bg-[var(--surface-muted)]" />
          </div>

          <div className="flex justify-end border-t border-[var(--border-soft)] pt-3 md:col-span-1 md:justify-center md:border-none md:pt-0">
            <div className="animate-shimmer h-8 w-8 rounded-lg bg-[var(--surface-muted)]" />
          </div>
        </div>
      ))}
    </div>
  );

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setFormLoading(true);

    try {
      await api.adminCreateUser({ username, email, password });
      setFormSuccess(`Akun admin @${username} berhasil dibuat!`);
      
      setUsername("");
      setEmail("");
      setPassword("");
      
      await reload();

      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(null);
      }, 1500);

    } catch (err: any) {
      setFormError(err.message ?? "Gagal membuat akun admin baru.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteAdmin() {
    if (!adminToDelete) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await api.adminDeleteUser(adminToDelete.id);
      setAdminToDelete(null);
      await reload();
    } catch (err: any) {
      setDeleteError(err.message ?? "Gagal menghapus admin.");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={smoothTransition}
      className="space-y-6 font-sans text-[var(--text-muted)] tracking-normal"
    >
      {/* Header Premium Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {loading ? (
          <div className="space-y-2">
            <div className="animate-shimmer h-8 w-60 rounded bg-[var(--surface-muted)]" />
            <div className="animate-shimmer h-4 w-[560px] max-w-full rounded bg-[var(--surface-muted)]" />
          </div>
        ) : (
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">Admin Management</h1>
            <p className="text-sm text-[var(--text-subtle)] leading-relaxed max-w-2xl">
              Kelola hak akses admin dan kontrol pendaftaran akun asisten monitor Anda di sini.
            </p>
          </div>
        )}
        {loading ? (
          <div className="animate-shimmer h-10 w-36 rounded-md bg-[var(--surface-muted)]" />
        ) : (
          <div>
            <motion.div 
              whileHover={{ scale: 1.015, y: -0.5 }} 
              whileTap={{ scale: 0.985 }}
              transition={{ type: "tween", duration: 0.2 }}
            >
              <Button
                icon={<Plus size={16} />}
                className="shadow-sm hover:shadow-md transition-shadow"
                onClick={() => {
                  setFormError(null);
                  setFormSuccess(null);
                  setIsModalOpen(true);
                }}
              >
                Register Admin
              </Button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Alerts Notification Banner */}
      <AnimatePresence mode="popLayout">
        {(deleteError || error) && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={smoothTransition}
            className="rounded-xl border border-[color-mix(in_srgb,var(--danger)_18%,transparent)] bg-[var(--danger-soft)] p-3.5 text-sm text-[var(--danger)] overflow-hidden font-medium"
          >
            {deleteError || error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Container List layout */}
      <Card className="p-0 overflow-hidden border border-[var(--border-soft)] bg-[var(--surface)] shadow-sm">
        {/* Header List */}
        <div className="p-4 border-b border-[var(--border-soft)] flex items-center justify-between bg-[var(--surface-muted)]/50 backdrop-blur-sm">
          {loading ? (
            <div className="animate-shimmer h-4 w-36 rounded bg-[var(--surface)]" />
          ) : (
            <span className="font-semibold text-[var(--text)] text-sm tracking-wide">Daftar Admin Aktif</span>
          )}
          {loading ? (
            <div className="animate-shimmer h-6 w-24 rounded-full bg-[var(--surface)]" />
          ) : (
            <span className="text-xs font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-2.5 py-0.5 rounded-full border border-[var(--accent-ring)]">
              {users?.length ?? 0} Pengguna
            </span>
          )}
        </div>

        {/* Header Grid Table Mock */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-[var(--border-soft)] text-xs font-bold uppercase tracking-wider text-[var(--text-subtle)] bg-[var(--surface-muted)]/30">
          <div className="col-span-5">Username & Email</div>
          <div className="col-span-3">Role</div>
          <div className="col-span-3">Dibuat Pada</div>
          <div className="col-span-1 text-center">Aksi</div>
        </div>

        {/* List Data Row Wrapper */}
        <div className="p-2 md:p-0">
          {loading ? (
            adminListSkeleton
          ) : users && users.length > 0 ? (
            <motion.div
              variants={tableContainerVariants}
              initial="hidden"
              animate="show"
              className="divide-y divide-[var(--border-soft)] block"
            >
              <AnimatePresence mode="popLayout">
                {users.map((u) => {
                  const isSelf = u.id === currentUser.id;
                  const isSuper = u.role === "SUPER_ADMIN";

                  return (
                    <motion.div
                      key={u.id}
                      variants={rowVariants}
                      layout="position"
                      transition={smoothTransition}
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center px-4 py-4 md:px-6 md:py-4 bg-[var(--surface)] rounded-xl md:rounded-none border border-[var(--border-soft)] md:border-none hover:bg-[var(--surface-hover)]"
                    >
                      {/* Col 1: Identity */}
                      <div className="md:col-span-5 flex flex-col justify-center">
                        <div className="font-bold text-[var(--text)] text-base md:text-sm flex items-center gap-2">
                          <span>@{u.username}</span>
                          {isSelf && (
                            <span className="text-[10px] tracking-wide bg-[var(--accent-soft)] text-[var(--accent)] px-2 py-0.5 rounded-md font-bold border border-[var(--accent-ring)]">
                              Anda
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[var(--text-subtle)] mt-0.5">{u.email}</div>
                      </div>

                      {/* Col 2: Badge Role */}
                      <div className="md:col-span-3 flex items-center">
                        <span className="block md:hidden text-xs font-semibold text-[var(--text-subtle)] mr-2">Role:</span>
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--accent)] border border-[var(--accent-ring)] shadow-sm">
                            <Shield size={12} />
                            Super Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--text-muted)] border border-[var(--border-soft)]">
                            Admin
                          </span>
                        )}
                      </div>

                      {/* Col 3: Date Created */}
                      <div className="md:col-span-3 flex items-center text-[var(--text-subtle)] text-xs">
                        <span className="block md:hidden text-xs font-semibold text-[var(--text-subtle)] mr-2">Dibuat:</span>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-[var(--text-subtle)] opacity-80" />
                          <span className="font-medium">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                          </span>
                        </div>
                      </div>

                      {/* Col 4: Action Button - Selalu Muncul Jelas */}
                      <div className="md:col-span-1 flex items-center justify-end md:justify-center border-t border-[var(--border-soft)] pt-3 md:pt-0 md:border-none">
                        <motion.button
                          type="button"
                          disabled={isSelf || isSuper}
                          onClick={() => setAdminToDelete(u)}
                          whileHover={!(isSelf || isSuper) ? { scale: 1.08 } : {}}
                          whileTap={!(isSelf || isSuper) ? { scale: 0.95 } : {}}
                          transition={{ type: "tween", duration: 0.15 }}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-[var(--text-muted)] shadow-sm ${
                            isSelf || isSuper 
                              ? "opacity-20 cursor-not-allowed border-transparent bg-transparent" 
                              : "border-[var(--border-soft)] bg-[var(--surface-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] hover:border-[color-mix(in_srgb,var(--danger)_25%,transparent)]"
                          }`}
                          title={isSelf ? "Anda tidak dapat menghapus diri sendiri" : isSuper ? "Super Admin tidak dapat dihapus" : "Hapus Admin"}
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="py-12 text-center text-[var(--text-subtle)] text-xs font-medium">
              Tidak ada pengguna admin terdaftar.
            </div>
          )}
        </div>
      </Card>

      {/* Creation Dialog Modal (AnimatePresence Murni untuk Menjamin Smooth Modal Content) */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Admin Baru"
        icon={<UserPlus size={16} />}
      >
        <AnimatedModalContent>
          <form onSubmit={(e) => void handleCreateAdmin(e)} className="space-y-4 pt-1">
            <AnimatePresence mode="popLayout">
              {formError && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={smoothTransition}
                  className="rounded-xl border border-[color-mix(in_srgb,var(--danger)_20%,transparent)] bg-[var(--danger-soft)] p-3 text-xs text-[var(--danger)] font-medium"
                >
                  {formError}
                </motion.div>
              )}
              {formSuccess && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={smoothTransition}
                  className="rounded-xl border border-[color-mix(in_srgb,var(--success)_20%,transparent)] bg-[var(--success-soft)] p-3 text-xs text-[var(--success)] flex items-center gap-2 font-medium"
                >
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>{formSuccess}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-subtle)]">
                Username
              </label>
              <Input
                type="text"
                required
                className="rounded-lg border-[var(--border-soft)] focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                icon={<User size={15} />}
              />
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-subtle)]">
                Email
              </label>
              <Input
                type="email"
                required
                className="rounded-lg border-[var(--border-soft)] focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={15} />}
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-subtle)]">
                Password Awal
              </label>
              <Input
                type="password"
                required
                className="rounded-lg border-[var(--border-soft)] focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="Min 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={15} />}
              />
            </div>

            {/* Modal Action Buttons */}
            <div className="pt-3 flex justify-end gap-2 border-t border-[var(--border-soft)] mt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[var(--text-subtle)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] rounded-lg transition-colors"
              >
                Batal
              </button>
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                transition={{ type: "tween", duration: 0.15 }}
              >
                <Button type="submit" disabled={formLoading} className="rounded-lg px-4 py-2 text-xs font-bold">
                  {formLoading ? "Membuat..." : "Simpan Admin"}
                </Button>
              </motion.div>
            </div>
          </form>
        </AnimatedModalContent>
      </Dialog>

      <Dialog
        isOpen={Boolean(adminToDelete)}
        onClose={() => {
          if (!deleteLoading) setAdminToDelete(null);
        }}
        title="Hapus Admin"
        icon={<Trash2 size={16} />}
      >
        <AnimatedModalContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-[var(--text)]">
                Yakin ingin menghapus @{adminToDelete?.username}?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-subtle)]">
                Admin ini akan kehilangan akses ke dashboard. Aksi ini tidak bisa dibatalkan dari halaman ini.
              </p>
            </div>

            {adminToDelete && (
              <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-3">
                <div className="text-sm font-semibold text-[var(--text)]">
                  @{adminToDelete.username}
                </div>
                <div className="mt-1 text-xs text-[var(--text-subtle)]">
                  {adminToDelete.email}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 border-t border-[var(--border-soft)] pt-4">
              <Button
                type="button"
                variant="ghost"
                disabled={deleteLoading}
                onClick={() => setAdminToDelete(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                icon={<Trash2 size={15} />}
                disabled={deleteLoading}
                onClick={() => void handleDeleteAdmin()}
              >
                {deleteLoading ? "Menghapus..." : "Hapus"}
              </Button>
            </div>
          </div>
        </AnimatedModalContent>
      </Dialog>
    </motion.div>
  );
}
