import { BarChart3, Bell, LogOut } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import type { User } from "../types";
import type { PageKey } from "./AppLayout";

type AppTopbarProps = {
  currentUser: User;
  onLogout: () => void;
  onPageChange: (page: PageKey) => void;
};

export function AppTopbar({ currentUser, onLogout, onPageChange }: AppTopbarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 h-20 border-b border-[var(--border-soft)] bg-[var(--topbar)] backdrop-blur-2xl">
      <div className="flex h-full items-center justify-between px-5 sm:px-7">
        <button
          type="button"
          onClick={() => onPageChange("overview")}
          className="flex items-center gap-3 text-left focus:outline-none"
          aria-label="Kembali ke overview"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)]">
            <BarChart3 size={20} />
          </div>
        </button>

        <div className="flex items-center gap-3">
          <ThemeToggle compact />
          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface-muted)] text-[var(--text-subtle)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] sm:inline-flex"
            aria-label="Notifikasi"
          >
            <Bell size={18} />
          </button>
          <button
            type="button"
            onClick={() => onPageChange("settings")}
            className="flex items-center gap-3 rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-2.5 py-1.5 hover:bg-[var(--surface-hover)] hover:border-[var(--accent-ring)] text-left focus:outline-none"
            title="Pengaturan Profil"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-extrabold uppercase text-[var(--accent-contrast)]">
              {currentUser.username[0]}
            </div>
            <div className="hidden min-w-0 sm:block">
              <div className="max-w-28 truncate text-sm font-extrabold uppercase leading-4 text-[var(--text)]">
                {currentUser.username}
              </div>
              <div className="text-xs capitalize leading-4 text-[var(--text-subtle)]">
                {currentUser.role.toLowerCase().replace("_", " ")}
              </div>
            </div>
          </button>
          <button
            onClick={onLogout}
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] text-[var(--text-subtle)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] md:inline-flex"
            title="Keluar Sesi"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
