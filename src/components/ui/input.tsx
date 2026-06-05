import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
  rightElement?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", icon, rightElement, ...props }, ref) => {
    if (icon || rightElement) {
      return (
        <div className="relative w-full rounded-lg border border-[var(--border)] bg-[var(--field-bg)] focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent-ring)]">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-subtle)]">
              {icon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              "h-11 w-full bg-transparent text-sm text-[var(--text)] placeholder-[var(--placeholder)] focus:outline-none disabled:opacity-40 disabled:pointer-events-none",
              icon ? "pl-9" : "px-3",
              rightElement ? "pr-9" : "pr-3",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightElement}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--field-bg)] px-3 text-sm text-[var(--text)] placeholder-[var(--placeholder)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] disabled:opacity-40 disabled:pointer-events-none",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
