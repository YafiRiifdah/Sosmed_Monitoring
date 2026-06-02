import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "../../lib/utils";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  maxWidth?: string;
};

export function Dialog({ isOpen, onClose, title, icon, children, maxWidth = "max-w-md" }: Props) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 transition-opacity" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-strong)] p-6 text-[var(--text-muted)] shadow-2xl backdrop-blur-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            maxWidth
          )}
        >
          {/* Close Button */}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1 text-[var(--text-subtle)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] transition-colors focus:outline-none">
            <X size={18} />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>

          {/* Title Header */}
          {title && (
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-soft)] mb-2 select-none">
              {icon && (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--border-soft)] shrink-0">
                  {icon}
                </div>
              )}
              <DialogPrimitive.Title className="text-base font-bold text-[var(--text)] tracking-wide">
                {title}
              </DialogPrimitive.Title>
            </div>
          )}

          {/* Children Body */}
          <div className="text-[var(--text-muted)]">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
