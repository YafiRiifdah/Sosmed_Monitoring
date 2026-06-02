import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export type CheckboxProps = {
  checked?: boolean;
  onChange?: (event: { target: { checked: boolean; type: "checkbox" } }) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  id?: string;
};

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked, onChange, disabled = false, label, className, id }, ref) => {
    return (
      <label className="flex h-11 items-center gap-2 text-sm text-[var(--text-muted)] cursor-pointer select-none">
        <CheckboxPrimitive.Root
          ref={ref}
          id={id}
          checked={checked}
          onCheckedChange={(checkedState) => {
            if (onChange) {
              onChange({
                target: {
                  checked: checkedState === true,
                  type: "checkbox",
                },
              });
            }
          }}
          disabled={disabled}
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[var(--border)] bg-[var(--field-bg)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-[var(--accent)] data-[state=checked]:bg-[var(--accent-soft)]",
            className
          )}
        >
          <CheckboxPrimitive.Indicator className="flex items-center justify-center text-[var(--accent)]">
            <Check className="h-3.5 w-3.5 stroke-[3.5]" />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {label && <span>{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
