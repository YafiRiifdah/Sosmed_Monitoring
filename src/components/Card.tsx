import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-[0_18px_50px_rgba(2,6,23,0.10)] backdrop-blur-xl transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}
