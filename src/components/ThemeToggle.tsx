import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-3 text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
      title={isDark ? "Aktifkan light mode" : "Aktifkan dark mode"}
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
      {!compact && <span>{isDark ? "Light" : "Dark"}</span>}
    </button>
  );
}
