import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  variant?: "primary" | "ghost" | "danger";
};

export function Button({ icon, children, variant = "primary", className = "", ...props }: Props) {
  const variants = {
    primary: "bg-ink text-white hover:bg-slate-700",
    ghost: "bg-white text-ink border border-line hover:bg-mist",
    danger: "bg-coral text-white hover:bg-red-700"
  };

  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
