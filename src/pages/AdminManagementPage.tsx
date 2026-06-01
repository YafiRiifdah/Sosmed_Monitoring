import { useCallback, useState } from "react";
import { UserPlus, Shield, Mail, Lock, User, Trash2, Calendar, CheckCircle2, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/Button";
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
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Admin Management</h1>
          <p className="text-sm text-slate-500">
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
        <div className="rounded-md bg-rose-50 border border-rose-100 p-3 text-xs text-rose-700">
          {deleteError}
        </div>
      )}

      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-100 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Full Width Admin List Table Card */}
      <Card className="p-0 overflow-hidden shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="font-bold text-slate-800 text-sm">Daftar Admin Aktif</span>
          <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
            {users?.length ?? 0} Pengguna
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/20">
                <th className="py-3.5 px-4">Username & Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Dibuat Pada</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
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
                    <tr key={u.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          @{u.username}
                          {isSelf && (
                            <span className="text-xxs bg-indigo-50 text-indigo-600 px-1.5 py-0.2 rounded font-normal">
                              Anda
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/10">
                            <Shield size={12} />
                            Super Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-500/10">
                            Admin
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-slate-400" />
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
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors ${
                            isSelf || isSuper ? "opacity-30 cursor-not-allowed border-transparent" : "border-slate-200"
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
                  <td colSpan={4} className="py-10 text-center text-slate-400 text-xs">
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
                  <UserPlus size={16} />
                </div>
                <h2 className="text-base font-bold text-slate-800">Tambah Admin Baru</h2>
              </div>

              {/* Form */}
              <form onSubmit={(e) => void handleCreateAdmin(e)} className="space-y-4">
                {formError && (
                  <div className="rounded-md bg-rose-50 border border-rose-100 p-3 text-xs text-rose-700">
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="rounded-md bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                {/* Username Input */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Username
                  </label>
                  <div className="relative rounded-md bg-slate-50 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:bg-white transition-all">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-transparent py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Email
                  </label>
                  <div className="relative rounded-md bg-slate-50 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:bg-white transition-all">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-transparent py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Password Awal
                  </label>
                  <div className="relative rounded-md bg-slate-50 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:bg-white transition-all">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="Min 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-transparent py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-400"
                    />
                  </div>
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
                    {formLoading ? "Membuat..." : "Simpan Admin"}
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
