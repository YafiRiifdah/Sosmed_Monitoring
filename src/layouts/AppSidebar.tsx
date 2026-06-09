import {
  BarChart3,
  ChevronDown,
  Facebook,
  FileText,
  Gauge,
  Instagram,
  Key,
  LogOut,
  Music2,
  Shield,
  Trophy,
  Users,
  UserCog,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import type { User, UserRole } from "../types";
import type { PageKey } from "./AppLayout";

type NavChildItem = {
  icon: ReactNode;
  key: PageKey;
  label: string;
  role?: UserRole;
};

type NavItem = {
  children?: NavChildItem[];
  icon: ReactNode;
  key?: PageKey;
  label: string;
  role?: UserRole;
};

const navItems: NavItem[] = [
  { key: "overview", label: "Overview", icon: <Gauge size={18} /> },
  {
    label: "Targets",
    icon: <Instagram size={18} />,
    children: [
      { key: "targetsInstagram", label: "Instagram", icon: <Instagram size={16} /> },
      { key: "targetsTikTok", label: "TikTok", icon: <Music2 size={16} /> },
      { key: "targetsFacebook", label: "Facebook", icon: <Facebook size={16} /> },
    ],
  },
  {
    label: "Monitored",
    icon: <Users size={18} />,
    children: [
      { key: "monitoredInstagram", label: "Instagram", icon: <Instagram size={16} /> },
      { key: "monitoredTikTok", label: "TikTok", icon: <Music2 size={16} /> },
      { key: "monitoredFacebook", label: "Facebook", icon: <Facebook size={16} /> },
    ],
  },
  {
    label: "Posts",
    icon: <FileText size={18} />,
    children: [
      { key: "postsInstagram", label: "Instagram", icon: <Instagram size={16} /> },
      { key: "postsTikTok", label: "TikTok", icon: <Music2 size={16} /> },
      { key: "postsFacebook", label: "Facebook", icon: <Facebook size={16} /> },
    ],
  },
  {
    label: "Ranking",
    icon: <Trophy size={18} />,
    children: [
      { key: "rankingInstagram", label: "Instagram", icon: <Instagram size={16} /> },
      { key: "rankingTikTok", label: "TikTok", icon: <Music2 size={16} /> },
      { key: "rankingFacebook", label: "Facebook", icon: <Facebook size={16} /> },
    ],
  },
  {
    label: "API Quota",
    icon: <Key size={18} />,
    children: [
      { key: "apiUsageInstagram", label: "Instagram", icon: <Instagram size={16} /> },
      { key: "apiUsageTikTok", label: "TikTok", icon: <Music2 size={16} /> },
      { key: "apiUsageFacebook", label: "Facebook", icon: <Facebook size={16} /> },
    ],
  },
  { key: "analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
  { key: "admin", label: "Admins", icon: <Shield size={18} />, role: "SUPER_ADMIN" },
  { key: "settings", label: "Settings", icon: <UserCog size={18} /> },
];

const sidebarOpenMenuStorageKey = "sidebar_open_menu";

type AppSidebarProps = {
  currentUser: User;
  onLogout: () => void;
  onPageChange: (page: PageKey) => void;
  page: PageKey;
};

export function AppSidebar({ currentUser, onLogout, onPageChange, page }: AppSidebarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(() => {
    try {
      return localStorage.getItem(sidebarOpenMenuStorageKey);
    } catch {
      return null;
    }
  });

  const visibleItems = navItems.filter((item) => !item.role || currentUser.role === item.role);

  const visibleMobileItems = visibleItems.reduce<NavChildItem[]>((items, item) => {
    if (item.children) return [...items, ...item.children];
    if (item.key) return [...items, { key: item.key, label: item.label, icon: item.icon, role: item.role }];
    return items;
  }, []);

  const isItemActive = (item: NavItem) => {
    if (item.key) return page === item.key;
    return item.children?.some((child) => child.key === page) ?? false;
  };

  useEffect(() => {
    try {
      if (openMenu) {
        localStorage.setItem(sidebarOpenMenuStorageKey, openMenu);
      } else {
        localStorage.removeItem(sidebarOpenMenuStorageKey);
      }
    } catch {
      // localStorage can be unavailable in private mode or strict browser settings.
    }
  }, [openMenu]);

  const toggleMenu = (label: string) => {
    setOpenMenu((current) => (current === label ? null : label));
  };

  return (
    <>
      <aside className="fixed bottom-0 left-0 top-20 hidden w-72 flex-col border-r border-[var(--border-soft)] bg-[var(--sidebar)] backdrop-blur-2xl lg:flex">
        <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4 pt-7 pb-4">
          {visibleItems.map((item) => {
            const active = isItemActive(item);
            const isOpen = item.children ? openMenu === item.label || active : false;

            return (
              <div key={item.key ?? item.label} className="space-y-1">
                <button
                  className={`group flex h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-bold transition-all duration-200 ${
                    active
                      ? "bg-[var(--accent-soft)] text-[var(--accent)] ring-1 ring-[var(--accent-ring)] shadow-sm"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
                  }`}
                  onClick={() => {
                    if (item.children) {
                      toggleMenu(item.label);
                      return;
                    }

                    if (item.key) {
                      onPageChange(item.key);
                    }
                  }}
                >
                  <span
                    className={`flex shrink-0 transition-colors duration-200 ${
                      active ? "text-[var(--accent)]" : "text-[var(--text-subtle)] group-hover:text-[var(--text)]"
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span className="min-w-0 flex-1 truncate">{item.label}</span>

                  {item.children && (
                    <ChevronDown
                      size={15}
                      className={`shrink-0 transition-all duration-300 ${
                        isOpen
                          ? "rotate-180 text-[var(--accent)]"
                          : "text-[var(--text-subtle)] group-hover:text-[var(--text)]"
                      }`}
                    />
                  )}
                </button>

                {item.children && (
                  <div
                    className={`grid overflow-hidden transition-all duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0">
                      <div className="relative ml-6 mt-2 space-y-1 border-l border-[var(--border-soft)] py-1 pl-4">
                        {item.children.map((child) => {
                          const childActive = page === child.key;

                          return (
                            <button
                              key={child.key}
                              onClick={() => onPageChange(child.key)}
                              className={`group relative flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-xs font-semibold transition-all duration-200 ${
                                childActive
                                  ? "bg-[var(--accent-soft)] text-[var(--accent)] ring-1 ring-[var(--accent-ring)] shadow-sm"
                                  : "text-[var(--text-subtle)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
                              }`}
                            >
                              {childActive && (
                                <span className="absolute -left-[21px] top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]" />
                              )}

                              <span
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                                  childActive
                                    ? "bg-[var(--accent)] text-white shadow-sm"
                                    : "bg-[var(--surface-muted)] text-[var(--text-subtle)] group-hover:text-[var(--text)]"
                                }`}
                              >
                                {child.icon}
                              </span>

                              <span className="truncate">{child.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-[var(--border-soft)] p-4">
          <button
            onClick={onLogout}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--text-muted)] transition-all duration-200 hover:border-[color-mix(in_srgb,var(--danger)_30%,transparent)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] focus:outline-none"
          >
            <LogOut size={14} />
            Keluar Sesi
          </button>
        </div>
      </aside>

      <div className="sticky top-20 z-20 border-b border-[var(--border-soft)] bg-[var(--topbar)]/90 backdrop-blur-xl lg:hidden">
        <div className="flex h-14 items-center justify-between gap-2 px-3">
          <div className="flex shrink items-center gap-1.5 overflow-x-auto py-2">
            {visibleMobileItems.map((item) => (
              <button
                key={item.key}
                className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-all duration-200 ${
                  page === item.key
                    ? "border border-[var(--accent-ring)] bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--text-subtle)] hover:text-[var(--text)]"
                }`}
                onClick={() => onPageChange(item.key)}
              >
                {item.icon}
                <span className="max-w-[70px] truncate xs:max-w-none">{item.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={onLogout}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-subtle)] transition-all duration-200 hover:text-[var(--danger)] active:bg-[var(--surface-hover)] focus:outline-none"
            title="Keluar Sesi"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
