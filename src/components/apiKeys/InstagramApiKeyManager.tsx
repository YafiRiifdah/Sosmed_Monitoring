import { Key, Lock, Mail, Shield, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../Button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";
import { CustomSelect } from "../ui/select";
import { api } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { ApiKeyOverviewSection } from "./ApiKeyOverviewSection";
import { ApiKeySupportSection } from "./ApiKeySupportSection";

type ApiKeyProvider = "rapidapi" | "apify";

type Props = {
  onLoadingChange?: (loading: boolean) => void;
};

export function InstagramApiKeyManager({ onLoadingChange }: Props) {
  const { data, loading, error, reload } = useAsync(useCallback(() => api.overview(), []));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [provider, setProvider] = useState<ApiKeyProvider>("rapidapi");
  const [accountName, setAccountName] = useState("");
  const [email, setEmail] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [notes, setNotes] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [activationLoading, setActivationLoading] = useState<string | null>(null);
  const [verificationLoading, setVerificationLoading] = useState<string | null>(null);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const apiUsageList = data?.apiUsage ?? [];
  const apiAccountsList = data?.apiAccounts ?? [];
  const rotationStats = data?.rotationStats ?? { rotationCount: 0, history: [] };

  const quotaSummary = apiAccountsList.reduce(
    (summary: { totalLimit: number; totalRemaining: number }, account: any) => {
      const usage = apiUsageList.find((item: any) => item.key === account.apiKeyMasked);

      return {
        totalLimit: summary.totalLimit + (usage?.limit ?? 100),
        totalRemaining: summary.totalRemaining + (usage?.remaining ?? 100)
      };
    },
    { totalLimit: 0, totalRemaining: 0 }
  );

  const totalKeys = apiAccountsList.length;
  const totalUsed = quotaSummary.totalLimit - quotaSummary.totalRemaining;
  const overallPct = quotaSummary.totalLimit === 0 ? 0 : Math.round((quotaSummary.totalRemaining / quotaSummary.totalLimit) * 100);
  const activeKeyAccount = apiAccountsList.find((account: any) => account.status === "active");
  const activeKeyName = activeKeyAccount ? activeKeyAccount.accountName : "Tidak ada";

  async function handleActivateKey(keyProvider: ApiKeyProvider, apiKeyMasked: string) {
    setActivationLoading(apiKeyMasked);
    setFormError(null);
    setFormSuccess(null);

    try {
      await api.activateApiKey({ provider: keyProvider, apiKeyMasked });
      setFormSuccess(`API KEY ${apiKeyMasked} berhasil diaktifkan secara manual.`);
      await reload();
      setTimeout(() => setFormSuccess(null), 1500);
    } catch (err: any) {
      setFormError(err.message ?? "Gagal mengaktifkan API KEY.");
    } finally {
      setActivationLoading(null);
    }
  }

  async function handleVerifyKey(keyProvider: ApiKeyProvider, apiKeyMasked: string) {
    setVerificationLoading(apiKeyMasked);
    setFormError(null);
    setFormSuccess(null);

    try {
      const res = await api.verifyApiKey({ provider: keyProvider, apiKeyMasked });
      setFormSuccess(`API KEY ${apiKeyMasked} berhasil diverifikasi! Sisa kuota: ${res.result.remaining}/${res.result.limit}.`);
      await reload();
      setTimeout(() => setFormSuccess(null), 3000);
    } catch (err: any) {
      setFormError(err.message ?? "Verifikasi API KEY gagal.");
      await reload();
      setTimeout(() => setFormError(null), 3000);
    } finally {
      setVerificationLoading(null);
    }
  }

  async function handleRegisterKey(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setFormLoading(true);

    try {
      await api.addApiKey({ provider, accountName, email, apiKey, notes });
      setFormSuccess(`API KEY ${provider === "rapidapi" ? "RapidAPI" : "Apify"} berhasil disimpan secara aman!`);
      setAccountName("");
      setEmail("");
      setApiKey("");
      setNotes("");
      await reload();
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(null);
      }, 1500);
    } catch (err: any) {
      setFormError(err.message ?? "Gagal menyimpan API KEY.");
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="space-y-6 font-sans text-[var(--text-muted)]">
      <ApiKeyOverviewSection
        activationLoading={activationLoading}
        activeKeyName={activeKeyName}
        apiAccountsList={apiAccountsList}
        apiUsageList={apiUsageList}
        error={error}
        formError={formError}
        formSuccess={formSuccess}
        isModalOpen={isModalOpen}
        loading={loading}
        onActivateKey={(keyProvider, apiKeyMasked) => void handleActivateKey(keyProvider, apiKeyMasked)}
        onOpenRegisterModal={() => {
          setFormError(null);
          setFormSuccess(null);
          setIsModalOpen(true);
        }}
        onRefresh={() => void reload()}
        onVerifyKey={(keyProvider, apiKeyMasked) => void handleVerifyKey(keyProvider, apiKeyMasked)}
        overallPct={overallPct}
        rotationCount={rotationStats.rotationCount}
        totalKeys={totalKeys}
        totalLimit={quotaSummary.totalLimit}
        totalRemaining={quotaSummary.totalRemaining}
        totalUsed={totalUsed}
        verificationLoading={verificationLoading}
      />

      <ApiKeySupportSection loading={loading} rotationStats={rotationStats} />

      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Daftarkan API KEY Baru"
        icon={<Key size={16} />}
      >
        <form onSubmit={(event) => void handleRegisterKey(event)} className="space-y-4">
          {formError && (
            <div className="rounded-md border border-[color-mix(in_srgb,var(--danger)_22%,transparent)] bg-[var(--danger-soft)] p-3 text-xs text-[var(--danger)]">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="rounded-md border border-[color-mix(in_srgb,var(--success)_22%,transparent)] bg-[var(--success-soft)] p-3 text-xs text-[var(--success)] flex items-center gap-1.5">
              <Shield size={14} className="shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
              Penyedia (Provider)
            </label>
            <CustomSelect
              value={provider}
              onChange={(value) => setProvider(value as ApiKeyProvider)}
              options={[
                { value: "rapidapi", label: "RapidAPI Key" },
                { value: "apify", label: "Apify Token" }
              ]}
              placeholder="Pilih provider"
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
              Nama Identitas Akun
            </label>
            <Input
              type="text"
              required
              placeholder="Contoh: RapidAPI Yafi 03"
              value={accountName}
              onChange={(event) => setAccountName(event.target.value)}
              icon={<User size={16} />}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
              Email Terdaftar Akun
            </label>
            <Input
              type="email"
              required
              placeholder="email@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              icon={<Mail size={16} />}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
              API KEY (Token Rahasia)
            </label>
            <Input
              type="password"
              required
              placeholder="Masukkan API KEY asli"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              icon={<Lock size={16} />}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
              Catatan (Opsional)
            </label>
            <Input
              type="text"
              placeholder="Reset kuota: Tanggal 15"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
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
              {formLoading ? "Menyimpan..." : "Simpan API KEY"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
