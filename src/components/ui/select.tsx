import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "../../lib/utils";

type Option = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function CustomSelect({ value, onChange, options, placeholder = "Select option", className = "", disabled = false }: Props) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--field-bg)] px-3 text-left text-sm text-[var(--text)] transition-colors duration-150 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] disabled:pointer-events-none disabled:opacity-40 data-[state=open]:border-[var(--accent)] data-[state=open]:ring-2 data-[state=open]:ring-[var(--accent-ring)]",
          className
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown size={15} className="text-[var(--text-subtle)] transition-transform duration-200" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="relative z-50 max-h-60 min-w-[8rem] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-1 shadow-[var(--card-shadow)] backdrop-blur-xl will-change-[opacity,transform] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-1"
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "relative flex w-full cursor-default select-none items-center rounded-md py-2 pl-8 pr-3 text-sm text-[var(--text-muted)] outline-none transition-colors duration-100 focus:bg-[var(--surface-hover)] focus:text-[var(--text)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[state=checked]:bg-[var(--accent-soft)] data-[state=checked]:font-semibold data-[state=checked]:text-[var(--accent)]"
                )}
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  <SelectPrimitive.ItemIndicator>
                    <Check className="h-4 w-4 text-[var(--accent)]" />
                  </SelectPrimitive.ItemIndicator>
                </span>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
