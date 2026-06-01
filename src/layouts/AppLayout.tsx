import { BarChart3, FileText, Gauge, Instagram, Key, LogOut, Shield, Trophy, Users } from "lucide-react";
import type { ReactNode } from "react";
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
    <div className="min-h-screen bg-mist">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-line px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-white">
            <BarChart3 size={19} />
          </div>
          <div>
            <div className="font-semibold">Engage Monitor</div>
            <div className="text-xs text-slate-500">Instagram MVP</div>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {visibleItems.map((item) => (
            <button
              key={item.key}
              className={`flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium ${
                page === item.key ? "bg-ink text-white" : "text-slate-600 hover:bg-mist hover:text-ink"
              }`}
              onClick={() => onPageChange(item.key)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-line bg-white p-4">
          <div className="mb-3 flex items-center gap-2.5 px-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-teal-400 to-indigo-500 text-xs font-bold text-white uppercase shadow-md shadow-teal-500/10">
              {currentUser.username[0]}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-800 truncate">@{currentUser.username}</div>
              <div className="text-[10px] text-slate-400 capitalize tracking-wide font-semibold">
                {currentUser.role.toLowerCase().replace("_", " ")}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-rose-600 hover:border-rose-200 transition-all focus:outline-none"
          >
            <LogOut size={14} />
            Keluar Sesi
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <header className="sticky top-0 z-10 border-b border-line bg-white lg:hidden">
          <div className="flex h-14 items-center justify-between px-3 gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto py-2 shrink">
              {visibleItems.map((item) => (
                <button
                  key={item.key}
                  className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium ${
                    page === item.key ? "bg-ink text-white" : "text-slate-600"
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
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:text-rose-600 active:bg-slate-50 focus:outline-none"
              title="Keluar Sesi"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Main Section */}
        <main className="mx-auto max-w-7xl p-4 sm:p-6 pb-24 lg:pb-6">{children}</main>
      </div>
    </div>
  );
}
