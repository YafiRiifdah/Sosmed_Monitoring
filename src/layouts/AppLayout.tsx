import { BarChart3, FileText, Gauge, Instagram, ListChecks, Trophy, Users } from "lucide-react";
import type { ReactNode } from "react";

export type PageKey = "overview" | "targets" | "monitored" | "posts" | "ranking";

const navItems: Array<{ key: PageKey; label: string; icon: ReactNode }> = [
  { key: "overview", label: "Overview", icon: <Gauge size={18} /> },
  { key: "targets", label: "Targets", icon: <Instagram size={18} /> },
  { key: "monitored", label: "Monitored", icon: <Users size={18} /> },
  { key: "posts", label: "Posts", icon: <FileText size={18} /> },
  { key: "ranking", label: "Ranking", icon: <Trophy size={18} /> }
];

export function AppLayout({ page, onPageChange, children }: { page: PageKey; onPageChange: (page: PageKey) => void; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-mist">
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
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium ${page === item.key ? "bg-ink text-white" : "text-slate-600 hover:bg-mist hover:text-ink"}`}
              onClick={() => onPageChange(item.key)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-line bg-white lg:hidden">
          <div className="flex h-14 items-center gap-2 overflow-x-auto px-3">
            {navItems.map((item) => (
              <button
                key={item.key}
                className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium ${page === item.key ? "bg-ink text-white" : "text-slate-600"}`}
                onClick={() => onPageChange(item.key)}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
