import { BarChart3, Bell, FileText, Gauge, Instagram, Key, LogOut, Shield, Trophy, Users, UserCog } from "lucide-react";
import type { ReactNode } from "react";
import { ThemeToggle } from "../components/ThemeToggle";
import type { User, UserRole } from "../types";

export type PageKey = "overview" | "targets" | "monitored" | "posts" | "ranking" | "apiUsage" | "admin" | "settings";

const navItems: Array<{ key: PageKey; label: string; icon: ReactNode; role?: UserRole }> = [
  { key: "overview", label: "Overview", icon: <Gauge size={18} /> },
  { key: "targets", label: "Targets", icon: <Instagram size={18} /> },
  { key: "monitored", label: "Monitored", icon: <Users size={18} /> },
  { key: "posts", label: "Posts", icon: <FileText size={18} /> },
  { key: "ranking", label: "Ranking", icon: <Trophy size={18} /> },
  { key: "apiUsage", label: "API Quota", icon: <Key size={18} /> },
  { key: "admin", label: "Admins", icon: <Shield size={18} />, role: "SUPER_ADMIN" },
  { key: "settings", label: "Settings", icon: <UserCog size={18} /> }
];

export function AppLayout({
  page,
  currentUser,
  onPageChange,
  onLogout,
  children
}: {
  page: PageKey;
  currentUser: User;
  onPageChange: (page: PageKey) => void;
  onLogout: () => void;
  children: ReactNode;
}) {
  // Filter menu items dynamically based on the current user's role
  const visibleItems = navItems.filter((item) => !item.role || currentUser.role === item.role);

  return (
    <div className="app-shell min-h-screen text-[var(--text)]">
      {/* Global Topbar */}
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
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface-muted)] text-[var(--text-subtle)] transition-all hover:bg-[var(--surface-hover)] hover:text-[var(--text)] sm:inline-flex"
              aria-label="Notifikasi"
            >
              <Bell size={18} />
            </button>
            <button
              type="button"
              onClick={() => onPageChange("settings")}
              className="flex items-center gap-3 rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-2.5 py-1.5 hover:bg-[var(--surface-hover)] hover:border-[var(--accent-ring)] transition-all text-left focus:outline-none"
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
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] text-[var(--text-subtle)] transition-all hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] md:inline-flex"
              title="Keluar Sesi"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="fixed bottom-0 left-0 top-20 hidden w-72 border-r border-[var(--border-soft)] bg-[var(--sidebar)] backdrop-blur-2xl lg:block">
        <nav className="space-y-2 p-4 pt-7">
          {visibleItems.map((item) => (
            <button
              key={item.key}
              className={`flex h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-bold transition-all duration-200 ${
                page === item.key 
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] ring-1 ring-[var(--accent-ring)]" 
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
              }`}
              onClick={() => onPageChange(item.key)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--border-soft)] p-4">
          <button
            onClick={onLogout}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--text-muted)] transition-all hover:border-[color-mix(in_srgb,var(--danger)_30%,transparent)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] focus:outline-none"
          >
            <LogOut size={14} />
            Keluar Sesi
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pt-20 lg:pl-72">
        {/* Mobile Header */}
        <div className="sticky top-20 z-20 border-b border-[var(--border-soft)] bg-[var(--topbar)]/90 backdrop-blur-xl lg:hidden">
          <div className="flex h-14 items-center justify-between gap-2 px-3">
            <div className="flex shrink items-center gap-1.5 overflow-x-auto py-2">
              {visibleItems.map((item) => (
                <button
                  key={item.key}
                  className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-all ${
                    page === item.key 
                      ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-ring)]" 
                      : "text-[var(--text-subtle)] hover:text-[var(--text)]"
                  }`}
                  onClick={() => onPageChange(item.key)}
                >
                  {item.icon}
                  <span className="max-w-[70px] xs:max-w-none truncate">{item.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={onLogout}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-subtle)] hover:text-[var(--danger)] active:bg-[var(--surface-hover)] focus:outline-none"
              title="Keluar Sesi"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Main Section */}
        <main className="w-full p-4 pb-24 sm:p-8 lg:p-10 lg:pb-10">{children}</main>
      </div>
    </div>
  );
}
