import { Check, Pencil, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import type { Account } from "../types";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";

type Props = {
  title: string;
  kind: "target" | "monitored";
};

export function AccountManager({ title, kind }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Account | null>(null);
  const [form, setForm] = useState({ username: "", displayName: "", kontingen: "", isActive: true });
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
      ...(kind === "monitored" ? { kontingen: form.kontingen || null } : {}),
      isActive: form.isActive
    };

    if (editing) {
      await (kind === "target" ? api.updateTarget(editing.id, payload) : api.updateMonitored(editing.id, payload));
    } else {
      await (kind === "target" ? api.createTarget(payload) : api.createMonitored(payload));
    }

    setEditing(null);
    setForm({ username: "", displayName: "", kontingen: "", isActive: true });
    await load();
  }

  async function submitBulkImport(event: FormEvent) {
    event.preventDefault();
    const accounts = bulkText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [username = "", displayName = "", kontingen = ""] = line.split(/[,;\t]/).map((part) => part.trim());
        return { username, displayName: displayName || null, kontingen: kontingen || null, isActive: true };
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
      kontingen: account.kontingen ?? "",
      isActive: account.isActive
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <Button onClick={() => void load()} variant="ghost">Refresh</Button>
      </div>

      <form onSubmit={(event) => void submit(event)} className={`grid gap-3 rounded-md border border-line bg-white p-4 ${kind === "monitored" ? "md:grid-cols-[1fr_1fr_1fr_auto_auto]" : "md:grid-cols-[1fr_1fr_auto_auto]"}`}>
        <input
          className="h-10 rounded-md border border-line px-3 text-sm"
          placeholder="username"
          value={form.username}
          onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
          required
        />
        <input
          className="h-10 rounded-md border border-line px-3 text-sm"
          placeholder="display name"
          value={form.displayName}
          onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
        />
        {kind === "monitored" && (
          <input
            className="h-10 rounded-md border border-line px-3 text-sm"
            placeholder="kontingen"
            value={form.kontingen}
            onChange={(event) => setForm((current) => ({ ...current, kontingen: event.target.value }))}
          />
        )}
        <label className="flex h-10 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
          />
          Active
        </label>
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
                setForm({ username: "", displayName: "", kontingen: "", isActive: true });
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      {kind === "monitored" && (
        <form onSubmit={(event) => void submitBulkImport(event)} className="space-y-3 rounded-md border border-line bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Bulk import akun wajib PAC</h2>
              <p className="text-xs text-slate-500">Format per baris: username, display name, kontingen</p>
            </div>
            <Button icon={<Upload size={16} />} type="submit" variant="ghost">Import</Button>
          </div>
          <textarea
            className="min-h-28 w-full resize-y rounded-md border border-line px-3 py-2 text-sm"
            placeholder={"pac_user_1, PAC 1, Kontingen A\npac_user_2, PAC 2, Kontingen A"}
            value={bulkText}
            onChange={(event) => setBulkText(event.target.value)}
          />
        </form>
      )}

      {error && <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      {loading ? <div className="text-sm text-slate-500">Loading...</div> : null}
      {!loading && accounts.length === 0 ? <EmptyState message="No accounts yet." /> : null}

      <div className="overflow-hidden rounded-md border border-line bg-white">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-mist text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Display Name</th>
              {kind === "monitored" && <th className="px-4 py-3">Kontingen</th>}
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium">@{account.username}</td>
                <td className="px-4 py-3 text-slate-600">{account.displayName ?? "-"}</td>
                {kind === "monitored" && <td className="px-4 py-3 text-slate-600">{account.kontingen ?? "-"}</td>}
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${account.isActive ? "border-teal-200 bg-teal-50 text-teal-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
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
  );
}
