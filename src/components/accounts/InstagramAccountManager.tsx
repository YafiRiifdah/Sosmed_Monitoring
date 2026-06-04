import {
  Check,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import type { Account } from "../../types";
import { Button } from "../Button";
import { EmptyState } from "../EmptyState";
import { AnimatedModalContent } from "../AnimatedModalContent";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { CustomSelect } from "../ui/select";
import { Dialog } from "../ui/dialog";

type Props = {
  title: string;
  kind: "target" | "monitored";
  onLoadingChange?: (loading: boolean) => void;
};

type StatusFilter = "all" | "active" | "inactive";

export function InstagramAccountManager({ title, kind, onLoadingChange }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Account | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [form, setForm] = useState({
    username: "",
    displayName: "",
    cabangPac: "",
    isActive: true,
  });

  const [bulkText, setBulkText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setAccounts(
        kind === "target"
          ? await api.targetAccounts()
          : await api.monitoredAccounts()
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const filteredAccounts = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return accounts.filter((account) => {
      const matchesSearch =
        !keyword ||
        [
          account.username,
          account.displayName,
          account.cabangPac,
          account.isActive ? "active" : "inactive",
        ]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(keyword));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && account.isActive) ||
        (statusFilter === "inactive" && !account.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [accounts, search, statusFilter]);

  const activeCount = accounts.filter((account) => account.isActive).length;
  const inactiveCount = accounts.length - activeCount;

  async function submit(event: FormEvent) {
    event.preventDefault();

    const payload = {
      username: form.username,
      displayName: form.displayName || null,
      ...(kind === "monitored"
        ? { cabangPac: form.cabangPac || null }
        : {}),
      isActive: form.isActive,
    };

    if (editing) {
      await (kind === "target"
        ? api.updateTarget(editing.id, payload)
        : api.updateMonitored(editing.id, payload));
    } else {
      await (kind === "target"
        ? api.createTarget(payload)
        : api.createMonitored(payload));
    }

    setEditing(null);
    setForm({
      username: "",
      displayName: "",
      cabangPac: "",
      isActive: true,
    });

    await load();
  }

  async function submitBulkImport(event: FormEvent) {
    event.preventDefault();

    const accounts = bulkText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [username = "", displayName = "", cabangPac = ""] = line
          .split(/[,;\t]/)
          .map((part) => part.trim());

        return {
          username,
          displayName: displayName || null,
          cabangPac: cabangPac || null,
          isActive: true,
        };
      })
      .filter((account) => account.username);

    if (accounts.length === 0) {
      setError("Isi minimal satu username untuk bulk import.");
      return;
    }

    setError(null);
    await api.bulkImportMonitored(accounts);
    setBulkText("");
    await load();
  }

  async function confirmRemove() {
    if (!accountToDelete) return;

    setDeleteLoading(true);
    setError(null);

    try {
      if (kind === "target") await api.deleteTarget(accountToDelete.id);
      else await api.deleteMonitored(accountToDelete.id);

      if (editing?.id === accountToDelete.id) {
        cancelEdit();
      }

      setAccountToDelete(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setDeleteLoading(false);
    }
  }

  function edit(account: Account) {
    setEditing(account);
    setForm({
      username: account.username,
      displayName: account.displayName ?? "",
      cabangPac: account.cabangPac ?? "",
      isActive: account.isActive,
    });
  }

  function cancelEdit() {
    setEditing(null);
    setForm({
      username: "",
      displayName: "",
      cabangPac: "",
      isActive: true,
    });
  }

  return (
    <div className="space-y-6 text-[var(--text-muted)]">
      <section className="rounded-2xl border border-[var(--border-soft)] bg-[linear-gradient(135deg,var(--surface),var(--surface-muted))] p-5 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {loading ? (
            <div className="space-y-2">
              <div className="animate-shimmer h-3 w-40 rounded bg-[var(--surface-muted)]" />
              <div className="animate-shimmer h-8 w-56 rounded bg-[var(--surface-muted)]" />
              <div className="animate-shimmer h-4 w-80 max-w-full rounded bg-[var(--surface-muted)]" />
            </div>
          ) : (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-subtle)]">
                Account Management
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
                {title}
              </h1>
              <p className="mt-1 text-sm text-[var(--text-subtle)]">
                Kelola akun, status aktif, dan data identitas monitoring.
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
            <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-3">
              <p className="text-xs text-[var(--text-subtle)]">Total</p>
              {loading ? (
                <div className="animate-shimmer mt-2 h-6 w-10 rounded bg-[var(--surface-muted)]" />
              ) : (
                <p className="mt-1 text-xl font-semibold text-[var(--text)]">
                  {accounts.length}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-[color-mix(in_srgb,var(--success)_22%,transparent)] bg-[var(--success-soft)] p-3">
              <p className="text-xs text-[var(--success)]">Active</p>
              {loading ? (
                <div className="animate-shimmer mt-2 h-6 w-10 rounded bg-[var(--surface)]" />
              ) : (
                <p className="mt-1 text-xl font-semibold text-[var(--success)]">
                  {activeCount}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-3">
              <p className="text-xs text-[var(--text-subtle)]">Inactive</p>
              {loading ? (
                <div className="animate-shimmer mt-2 h-6 w-10 rounded bg-[var(--surface)]" />
              ) : (
                <p className="mt-1 text-xl font-semibold text-[var(--text-muted)]">
                  {inactiveCount}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-sm backdrop-blur-xl">
        {loading ? (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="space-y-2">
                <div className="animate-shimmer h-4 w-32 rounded bg-[var(--surface-muted)]" />
                <div className="animate-shimmer h-3 w-64 max-w-full rounded bg-[var(--surface-muted)]" />
              </div>
            </div>

            <div
              className={`grid gap-3 ${
                kind === "monitored"
                  ? "lg:grid-cols-[1fr_1fr_1fr_auto_auto]"
                  : "lg:grid-cols-[1fr_1fr_auto_auto]"
              }`}
            >
              <div className="animate-shimmer h-10 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)]" />
              <div className="animate-shimmer h-10 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)]" />
              {kind === "monitored" && (
                <div className="animate-shimmer h-10 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)]" />
              )}
              <div className="animate-shimmer h-10 min-w-28 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)]" />
              <div className="animate-shimmer h-10 min-w-24 rounded-xl bg-[var(--surface-muted)]" />
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-[var(--text)]">
                  {editing ? "Edit Account" : "Add New Account"}
                </h2>
                <p className="text-xs text-[var(--text-subtle)]">
                  {editing
                    ? "Perbarui data akun yang sudah terdaftar."
                    : "Tambahkan akun baru ke sistem monitoring."}
                </p>
              </div>

              {editing && (
                <span className="rounded-full border border-[color-mix(in_srgb,var(--warning)_22%,transparent)] bg-[var(--warning-soft)] px-3 py-1 text-xs font-medium text-[var(--warning)]">
                  Editing @{editing.username}
                </span>
              )}
            </div>

            <form
              onSubmit={(event) => void submit(event)}
              className={`grid gap-3 ${
                kind === "monitored"
                  ? "lg:grid-cols-[1fr_1fr_1fr_auto_auto]"
                  : "lg:grid-cols-[1fr_1fr_auto_auto]"
              }`}
            >
              <Input
                placeholder="Username"
                value={form.username}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    username: event.target.value,
                  }))
                }
                required
              />

              <Input
                placeholder="Display Name"
                value={form.displayName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    displayName: event.target.value,
                  }))
                }
              />

              {kind === "monitored" && (
                <Input
                  placeholder="Cabang PAC"
                  value={form.cabangPac}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      cabangPac: event.target.value,
                    }))
                  }
                />
              )}

              <div className="flex items-center rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] px-3">
                <Checkbox
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                  label="Active"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  icon={editing ? <Save size={16} /> : <Plus size={16} />}
                  type="submit"
                >
                  {editing ? "Save" : "Add"}
                </Button>

                {editing && (
                  <Button
                    icon={<X size={16} />}
                    type="button"
                    variant="ghost"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </>
        )}
      </section>

      {kind === "monitored" && (
        <section className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-sm backdrop-blur-xl">
          {loading ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="animate-shimmer h-4 w-48 rounded bg-[var(--surface-muted)]" />
                  <div className="animate-shimmer h-3 w-72 max-w-full rounded bg-[var(--surface-muted)]" />
                </div>
                <div className="animate-shimmer h-10 w-24 rounded-xl bg-[var(--surface-muted)]" />
              </div>

              <div className="animate-shimmer h-24 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)]" />
            </div>
          ) : (
            <form
              onSubmit={(event) => void submitBulkImport(event)}
              className="space-y-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-[var(--text)]">
                    Bulk Import Akun Wajib PAC
                  </h2>
                  <p className="mt-1 text-xs text-[var(--text-subtle)]">
                    Format per baris: username, display name, Cabang PAC
                  </p>
                </div>

                <Button icon={<Upload size={16} />} type="submit" variant="ghost">
                  Import
                </Button>
              </div>

              <Textarea
                placeholder={
                  "pac_user_1, PAC 1, Cabang PAC A\npac_user_2, PAC 2, Cabang PAC A"
                }
                value={bulkText}
                onChange={(event) => setBulkText(event.target.value)}
              />
            </form>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-3 border-b border-[var(--border-soft)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[var(--text)]">
              Account List
            </h2>
            {loading ? (
              <div className="animate-shimmer mt-2 h-3 w-44 rounded bg-[var(--surface-muted)]" />
            ) : (
              <p className="text-xs text-[var(--text-subtle)]">
                {filteredAccounts.length} dari {accounts.length} akun ditampilkan.
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="animate-shimmer h-10 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] sm:w-[240px]" />
              <div className="animate-shimmer h-10 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] sm:w-[150px]" />
              <div className="animate-shimmer h-10 rounded-xl bg-[var(--surface-muted)] sm:w-28" />
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]"
                />

                <Input
                  placeholder="Search account..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9 sm:w-[240px]"
                />
              </div>

              <CustomSelect
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as StatusFilter)}
                options={[
                  { value: "all", label: "All Status" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
                className="sm:w-[150px]"
              />

              <Button
                onClick={() => void load()}
                variant="ghost"
                icon={<RefreshCw size={16} />}
                type="button"
              >
                Refresh
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="m-5 rounded-xl border border-[color-mix(in_srgb,var(--danger)_22%,transparent)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">
            {error}
          </div>
        )}

        {loading && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[var(--surface-muted)] text-xs uppercase tracking-wide text-[var(--text-subtle)]">
                <tr>
                  <th className="px-5 py-4">Username</th>
                  <th className="px-5 py-4">Display Name</th>
                  {kind === "monitored" && (
                    <th className="px-5 py-4">Cabang PAC</th>
                  )}
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border-soft)]">
                {Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="animate-shimmer h-9 w-9 rounded-full bg-[var(--surface-muted)]" />
                        <div className="space-y-2">
                          <div className="animate-shimmer h-4 w-28 rounded bg-[var(--surface-muted)]" />
                          <div className="animate-shimmer h-3 w-24 rounded bg-[var(--surface-muted)]" />
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="animate-shimmer h-4 w-36 rounded bg-[var(--surface-muted)]" />
                    </td>

                    {kind === "monitored" && (
                      <td className="px-5 py-4">
                        <div className="animate-shimmer h-4 w-28 rounded bg-[var(--surface-muted)]" />
                      </td>
                    )}

                    <td className="px-5 py-4">
                      <div className="animate-shimmer h-7 w-20 rounded-full bg-[var(--surface-muted)]" />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <div className="animate-shimmer h-9 w-20 rounded-xl bg-[var(--surface-muted)]" />
                        <div className="animate-shimmer h-9 w-24 rounded-xl bg-[var(--surface-muted)]" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && accounts.length === 0 && (
          <div className="p-5">
            <EmptyState message="Belum ada akun terdaftar." />
          </div>
        )}

        {!loading && accounts.length > 0 && filteredAccounts.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-[var(--text)]">
              Tidak ada akun yang cocok.
            </p>
            <p className="mt-1 text-xs text-[var(--text-subtle)]">
              Coba gunakan kata kunci atau filter lain.
            </p>
          </div>
        )}

        {!loading && filteredAccounts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[var(--surface-muted)] text-xs uppercase tracking-wide text-[var(--text-subtle)]">
                <tr>
                  <th className="px-5 py-4">Username</th>
                  <th className="px-5 py-4">Display Name</th>
                  {kind === "monitored" && (
                    <th className="px-5 py-4">Cabang PAC</th>
                  )}
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border-soft)]">
                {filteredAccounts.map((account) => (
                  <tr
                    key={account.id}
                    className="group transition-colors hover:bg-[var(--surface-hover)]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface-muted)] text-xs font-semibold text-[var(--text)]">
                          {account.username.slice(0, 2).toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-[var(--text)]">
                            @{account.username}
                          </p>
                          <p className="text-xs text-[var(--text-subtle)]">
                            Account username
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-[var(--text-muted)]">
                      {account.displayName ?? "-"}
                    </td>

                    {kind === "monitored" && (
                      <td className="px-5 py-4 text-[var(--text-muted)]">
                        {account.cabangPac ?? "-"}
                      </td>
                    )}

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                          account.isActive
                            ? "border-[color-mix(in_srgb,var(--success)_22%,transparent)] bg-[var(--success-soft)] text-[var(--success)]"
                            : "border-[var(--border-soft)] bg-[var(--surface-muted)] text-[var(--text-muted)]"
                        }`}
                      >
                        {account.isActive && <Check size={13} />}
                        {account.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          icon={<Pencil size={15} />}
                          variant="ghost"
                          onClick={() => edit(account)}
                          type="button"
                        >
                          Edit
                        </Button>

                        <Button
                          icon={<Trash2 size={15} />}
                          variant="danger"
                          onClick={() => setAccountToDelete(account)}
                          type="button"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Dialog
        isOpen={Boolean(accountToDelete)}
        onClose={() => {
          if (!deleteLoading) setAccountToDelete(null);
        }}
        title="Hapus Akun"
        icon={<Trash2 size={16} />}
      >
        <AnimatedModalContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-[var(--text)]">
                Yakin ingin menghapus @{accountToDelete?.username}?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-subtle)]">
                Aksi ini akan menghapus akun dari daftar {kind === "target" ? "target" : "monitored"} dan tidak bisa dibatalkan dari halaman ini.
              </p>
            </div>

            {accountToDelete && (
              <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-3">
                <div className="text-sm font-semibold text-[var(--text)]">
                  @{accountToDelete.username}
                </div>
                <div className="mt-1 text-xs text-[var(--text-subtle)]">
                  {accountToDelete.displayName || "No display name"}
                  {kind === "monitored" && accountToDelete.cabangPac
                    ? ` • ${accountToDelete.cabangPac}`
                    : ""}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 border-t border-[var(--border-soft)] pt-4">
              <Button
                type="button"
                variant="ghost"
                disabled={deleteLoading}
                onClick={() => setAccountToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                icon={<Trash2 size={15} />}
                disabled={deleteLoading}
                onClick={() => void confirmRemove()}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </AnimatedModalContent>
      </Dialog>
    </div>
  );
}
