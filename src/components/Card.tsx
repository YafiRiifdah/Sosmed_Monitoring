import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-[var(--card-shadow)] backdrop-blur-xl transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}
