import { useCallback, useState } from "react";
import { UserPlus, Shield, Mail, Lock, User, Trash2, Calendar, CheckCircle2, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/Button";
import { Input } from "../components/ui/input";
import { Dialog } from "../components/ui/dialog";
import { Card } from "../components/Card";
import { Skeleton } from "../components/Skeleton";
import { api } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import type { User as UserType } from "../types";

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

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setFormLoading(true);

    try {
      await api.adminCreateUser({ username, email, password });
      setFormSuccess(`Akun admin @${username} berhasil dibuat!`);
      
      // Clear inputs
      setUsername("");
      setEmail("");
      setPassword("");
      
      // Reload admin list
      await reload();

      // Close modal after a short delay
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

  async function handleDeleteAdmin(id: string, name: string) {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus akun admin @${name}?`)) {
      return;
    }

    setDeleteError(null);
    try {
      await api.adminDeleteUser(id);
      await reload();
    } catch (err: any) {
      setDeleteError(err.message ?? "Gagal menghapus admin.");
    }
  }

  return (
    <div className="space-y-6 font-sans text-[var(--text-muted)]">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text)] tracking-wide">Admin Management</h1>
          <p className="text-sm text-[var(--text-subtle)]">
            Kelola hak akses admin dan kontrol pendaftaran akun asisten monitor Anda di sini.
          </p>
        </div>
        <div>
          <Button
            icon={<Plus size={16} />}
            onClick={() => {
              setFormError(null);
              setFormSuccess(null);
              setIsModalOpen(true);
            }}
          >
            Register Admin
          </Button>
        </div>
      </div>

      {deleteError && (
        <div className="rounded-md border border-[color-mix(in_srgb,var(--danger)_22%,transparent)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">
          {deleteError}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-[color-mix(in_srgb,var(--danger)_22%,transparent)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      {/* Full Width Admin List Table Card */}
      <Card className="p-0 overflow-hidden border border-[var(--border-soft)] bg-[var(--surface)]">
        <div className="p-4 border-b border-[var(--border-soft)] flex items-center justify-between bg-[var(--surface-muted)]">
          <span className="font-bold text-[var(--text-muted)] text-sm">Daftar Admin Aktif</span>
          <span className="text-xs font-semibold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full border border-[var(--accent-ring)]">
            {users?.length ?? 0} Pengguna
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-soft)] text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)] bg-[var(--surface-muted)]">
                <th className="py-3.5 px-4">Username & Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Dibuat Pada</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-soft)]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 px-4">
                    <Skeleton variant="row" count={3} />
                  </td>
                </tr>
              ) : users && users.length > 0 ? (
                users.map((u) => {
                  const isSelf = u.id === currentUser.id;
                  const isSuper = u.role === "SUPER_ADMIN";

                  return (
                    <tr key={u.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[var(--text)] flex items-center gap-1.5">
                          @{u.username}
                          {isSelf && (
                            <span className="text-[10px] bg-[var(--accent-soft)] text-[var(--accent)] px-1.5 py-0.2 rounded font-semibold border border-[var(--accent-ring)]">
                              Anda
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[var(--text-subtle)]">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)] border border-[var(--accent-ring)]">
                            <Shield size={12} />
                            Super Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-muted)] border border-[var(--border-soft)]">
                            Admin
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[var(--text-subtle)] text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-[var(--text-subtle)]" />
                          <span>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          disabled={isSelf || isSuper}
                          onClick={() => void handleDeleteAdmin(u.id, u.username)}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-[var(--text-subtle)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] hover:border-[color-mix(in_srgb,var(--danger)_30%,transparent)] transition-all ${
                            isSelf || isSuper ? "opacity-20 cursor-not-allowed border-transparent" : "border-[var(--border)] bg-[var(--surface-muted)] active:scale-95"
                          }`}
                          title={isSelf ? "Anda tidak dapat menghapus diri sendiri" : isSuper ? "Super Admin tidak dapat dihapus" : "Hapus Admin"}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-[var(--text-subtle)] text-xs">
                    Tidak ada pengguna admin terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* GORGEOUS FROSTED GLASS MODAL OVERLAY */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Admin Baru"
        icon={<UserPlus size={16} />}
      >
        <form onSubmit={(e) => void handleCreateAdmin(e)} className="space-y-4">
          {formError && (
            <div className="rounded-md border border-[color-mix(in_srgb,var(--danger)_22%,transparent)] bg-[var(--danger-soft)] p-3 text-xs text-[var(--danger)]">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="rounded-md border border-[color-mix(in_srgb,var(--success)_22%,transparent)] bg-[var(--success-soft)] p-3 text-xs text-[var(--success)] flex items-center gap-1.5">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
              Username
            </label>
            <Input
              type="text"
              required
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<User size={16} />}
            />
          </div>

          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
              Email
            </label>
            <Input
              type="email"
              required
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={16} />}
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
              Password Awal
            </label>
            <Input
              type="password"
              required
              placeholder="Min 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={16} />}
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
              {formLoading ? "Membuat..." : "Simpan Admin"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
