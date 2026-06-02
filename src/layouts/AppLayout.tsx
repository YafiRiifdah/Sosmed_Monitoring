import { BarChart3, FileText, Gauge, Instagram, Key, LogOut, Shield, Trophy, Users } from "lucide-react";
import type { ReactNode } from "react";
import { ThemeToggle } from "../components/ThemeToggle";
import type { User, UserRole } from "../types";

export type PageKey = "overview" | "targets" | "monitored" | "posts" | "ranking" | "apiUsage" | "admin";

const navItems: Array<{ key: PageKey; label: string; icon: ReactNode; role?: UserRole }> = [
  { key: "overview", label: "Overview", icon: <Gauge size={18} /> },
  { key: "targets", label: "Targets", icon: <Instagram size={18} /> },
  { key: "monitored", label: "Monitored", icon: <Users size={18} /> },
  { key: "posts", label: "Posts", icon: <FileText size={18} /> },
  { key: "ranking", label: "Ranking", icon: <Trophy size={18} /> },
  { key: "apiUsage", label: "API Quota", icon: <Key size={18} /> },
  { key: "admin", label: "Admins", icon: <Shield size={18} />, role: "SUPER_ADMIN" }
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
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[var(--border-soft)] bg-[var(--app-bg-soft)]/88 backdrop-blur-2xl lg:block">
        <div className="flex h-18 items-center gap-3 border-b border-[var(--border-soft)] px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-sm shadow-sky-400/10">
            <BarChart3 size={19} />
          </div>
          <div>
            <div className="font-semibold tracking-wide text-[var(--text)]">Engage Monitor</div>
            <div className="mt-0.5 text-[10px] text-[var(--text-subtle)] font-mono uppercase tracking-[0.2em]">Admin Console</div>
          </div>
        </div>
        <nav className="space-y-1.5 p-4">
          {visibleItems.map((item) => (
            <button
              key={item.key}
              className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition-all duration-200 ${
                page === item.key 
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm ring-1 ring-[var(--accent-ring)]" 
                  : "text-[var(--text-subtle)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
              }`}
              onClick={() => onPageChange(item.key)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--border-soft)] bg-[var(--app-bg-soft)]/74 p-4">
          <div className="mb-3 flex items-center gap-3 px-1 py-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-extrabold text-[var(--accent-contrast)] uppercase shadow-sm shadow-sky-400/15">
              {currentUser.username[0]}
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="text-xs font-bold text-[var(--text-muted)] truncate">@{currentUser.username}</div>
              <div className="text-[10px] text-[var(--text-subtle)] capitalize tracking-wide font-semibold">
                {currentUser.role.toLowerCase().replace("_", " ")}
              </div>
            </div>
            <ThemeToggle compact />
          </div>
          <button
            onClick={onLogout}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--danger)] hover:border-rose-500/30 transition-all focus:outline-none"
          >
            <LogOut size={14} />
            Keluar Sesi
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-72">
        {/* Mobile Header */}
        <header className="sticky top-0 z-10 border-b border-[var(--border-soft)] bg-[var(--app-bg-soft)]/80 backdrop-blur-xl lg:hidden">
          <div className="flex h-14 items-center justify-between px-3 gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto py-2 shrink">
              {visibleItems.map((item) => (
                <button
                  key={item.key}
                  className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-all ${
                    page === item.key 
                      ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-sky-500/20" 
                      : "text-[var(--text-subtle)] hover:text-[var(--text)]"
                  }`}
                  onClick={() => onPageChange(item.key)}
                >
                  {item.icon}
                  <span className="max-w-[70px] xs:max-w-none truncate">{item.label}</span>
                </button>
              ))}
            </div>
            
            <ThemeToggle compact />
            <button
              onClick={onLogout}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-subtle)] hover:text-[var(--danger)] active:bg-[var(--surface-hover)] focus:outline-none"
              title="Keluar Sesi"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Main Section */}
        <main className="mx-auto max-w-7xl p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">{children}</main>
      </div>
    </div>
  );
}
