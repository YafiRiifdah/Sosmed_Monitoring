import { Check, Pencil, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import type { Account } from "../types";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";

type Props = {
  title: string;
  kind: "target" | "monitored";
};

export function AccountManager({ title, kind }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Account | null>(null);
  const [form, setForm] = useState({ username: "", displayName: "", cabangPac: "", isActive: true });
  const [bulkText, setBulkText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAccounts(kind === "target" ? await api.targetAccounts() : await api.monitoredAccounts());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      username: form.username,
      displayName: form.displayName || null,
      ...(kind === "monitored" ? { cabangPac: form.cabangPac || null } : {}),
      isActive: form.isActive
    };

    if (editing) {
      await (kind === "target" ? api.updateTarget(editing.id, payload) : api.updateMonitored(editing.id, payload));
    } else {
      await (kind === "target" ? api.createTarget(payload) : api.createMonitored(payload));
    }

    setEditing(null);
    setForm({ username: "", displayName: "", cabangPac: "", isActive: true });
    await load();
  }

  async function submitBulkImport(event: FormEvent) {
    event.preventDefault();
    const accounts = bulkText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [username = "", displayName = "", cabangPac = ""] = line.split(/[,;\t]/).map((part) => part.trim());
        return { username, displayName: displayName || null, cabangPac: cabangPac || null, isActive: true };
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

  async function remove(id: string) {
    if (kind === "target") await api.deleteTarget(id);
    else await api.deleteMonitored(id);
    await load();
  }

  function edit(account: Account) {
    setEditing(account);
    setForm({
      username: account.username,
      displayName: account.displayName ?? "",
      cabangPac: account.cabangPac ?? "",
      isActive: account.isActive
    });
  }

  return (
    <div className="space-y-5 text-[var(--text-muted)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-[var(--text)] tracking-wide">{title}</h1>
        <Button onClick={() => void load()} variant="ghost">Refresh</Button>
      </div>

      <form 
        onSubmit={(event) => void submit(event)} 
        className={`grid gap-3 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 backdrop-blur-xl ${
          kind === "monitored" ? "md:grid-cols-[1fr_1fr_1fr_auto_auto]" : "md:grid-cols-[1fr_1fr_auto_auto]"
        }`}
      >
        <Input
          placeholder="Username"
          value={form.username}
          onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
          required
        />
        <Input
          placeholder="Display Name"
          value={form.displayName}
          onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
        />
        {kind === "monitored" && (
          <Input
            placeholder="Cabang PAC"
            value={form.cabangPac}
            onChange={(event) => setForm((current) => ({ ...current, cabangPac: event.target.value }))}
          />
        )}
        <Checkbox
          checked={form.isActive}
          onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
          label="Active"
        />
        <div className="flex gap-2">
          <Button icon={editing ? <Save size={16} /> : <Plus size={16} />} type="submit">
            {editing ? "Save" : "Add"}
          </Button>
          {editing && (
            <Button
              icon={<X size={16} />}
              type="button"
              variant="ghost"
              onClick={() => {
                setEditing(null);
                setForm({ username: "", displayName: "", cabangPac: "", isActive: true });
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      {kind === "monitored" && (
        <form onSubmit={(event) => void submitBulkImport(event)} className="space-y-3 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text)]">Bulk Import Akun Wajib PAC</h2>
              <p className="text-xs text-[var(--text-subtle)]">Format per baris: username, display name, Cabang PAC</p>
            </div>
            <Button icon={<Upload size={16} />} type="submit" variant="ghost">Import</Button>
          </div>
          <Textarea
            placeholder={"pac_user_1, PAC 1, Cabang PAC A\npac_user_2, PAC 2, Cabang PAC A"}
            value={bulkText}
            onChange={(event) => setBulkText(event.target.value)}
          />
        </form>
      )}

      {error && <div className="rounded-md border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</div>}
      {loading ? <div className="text-sm text-[var(--text-subtle)] animate-pulse">Loading accounts...</div> : null}
      {!loading && accounts.length === 0 ? <EmptyState message="Belum ada target akun terdaftar." /> : null}

      {!loading && accounts.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--surface)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-[var(--surface-muted)] text-xs uppercase text-[var(--text-subtle)] border-b border-[var(--border-soft)]">
                <tr>
                  <th className="px-4 py-3.5">Username</th>
                  <th className="px-4 py-3.5">Display Name</th>
                  {kind === "monitored" && <th className="px-4 py-3.5">Cabang PAC</th>}
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-soft)]">
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-[var(--surface-hover)] transition-all">
                    <td className="px-4 py-3 font-semibold text-[var(--text)]">@{account.username}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{account.displayName ?? "-"}</td>
                    {kind === "monitored" && <td className="px-4 py-3 text-[var(--text-muted)]">{account.cabangPac ?? "-"}</td>}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        account.isActive 
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" 
                          : "border-slate-500/20 bg-slate-500/10 text-slate-400"
                      }`}>
                        {account.isActive && <Check size={13} />}
                        {account.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button icon={<Pencil size={15} />} variant="ghost" onClick={() => edit(account)} type="button">Edit</Button>
                        <Button icon={<Trash2 size={15} />} variant="danger" onClick={() => void remove(account.id)} type="button">Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
