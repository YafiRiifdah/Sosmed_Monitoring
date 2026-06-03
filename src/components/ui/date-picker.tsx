import { getLocalTimeZone, parseDate, type DateValue } from "@internationalized/date";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useMemo } from "react";
import {
  Button as AriaButton,
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  DateInput,
  DatePicker as AriaDatePicker,
  DateSegment,
  Dialog,
  Group,
  Heading,
  Popover
} from "react-aria-components";
import { cn } from "../../lib/utils";

type DatePickerFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

function parseDateValue(value: string): DateValue | null {
  if (!value) return null;

  try {
    return parseDate(value);
  } catch {
    return null;
  }
}

export function DatePickerField({ value, onChange, placeholder = "Pilih tanggal", className }: DatePickerFieldProps) {
  const dateValue = useMemo(() => parseDateValue(value), [value]);
  return (
    <AriaDatePicker
      aria-label={placeholder}
      value={dateValue}
      onChange={(date) => onChange(date?.toString() ?? "")}
      className={cn("relative w-full", className)}
    >
      <Group className="relative flex h-11 w-full items-center rounded-lg border border-[var(--border)] bg-[var(--field-bg)] px-3 text-sm text-[var(--text)] transition-colors focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent-ring)]">
        <DateInput className="flex min-w-0 flex-1 items-center gap-px">
          {(segment) => (
            <DateSegment
              segment={segment}
              className="rounded px-0.5 tabular-nums outline-none data-[focused]:bg-[var(--accent-soft)] data-[focused]:text-[var(--accent)] data-[placeholder]:text-[var(--placeholder)]"
            />
          )}
        </DateInput>
        {dateValue && (
          <button
            type="button"
            aria-label="Clear date"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onChange("");
            }}
            className="ml-2 rounded-md p-1 text-[var(--text-subtle)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
          >
            <X size={14} />
          </button>
        )}
        <AriaButton
          type="button"
          aria-label="Open calendar"
          className="ml-2 rounded-md p-1 text-[var(--text-subtle)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
        >
          <CalendarIcon size={17} />
        </AriaButton>
      </Group>

      <Popover
        offset={8}
        placement="bottom start"
        shouldFlip={false}
        className="z-50 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-3 text-[var(--text)] shadow-[var(--card-shadow)] outline-none"
      >
        <Dialog className="outline-none">
          <Calendar className="w-[18rem]">
            <header className="mb-3 flex items-center justify-between gap-2">
              <AriaButton
                slot="previous"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
              >
                <ChevronLeft size={17} />
              </AriaButton>
              <Heading className="text-sm font-semibold text-[var(--text)]" />
              <AriaButton
                slot="next"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
              >
                <ChevronRight size={17} />
              </AriaButton>
            </header>

            <CalendarGrid className="w-full border-separate border-spacing-1">
              <CalendarGridHeader>
                {(day) => (
                  <CalendarHeaderCell className="h-8 text-xs font-medium text-[var(--text-subtle)]">
                    {day}
                  </CalendarHeaderCell>
                )}
              </CalendarGridHeader>
              <CalendarGridBody>
                {(date) => (
                  <CalendarCell
                    date={date}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-sm text-[var(--text-muted)] outline-none transition hover:bg-[var(--surface-hover)] hover:text-[var(--text)] data-[disabled]:pointer-events-none data-[disabled]:opacity-30 data-[outside-month]:text-[var(--placeholder)] data-[selected]:bg-[var(--accent)] data-[selected]:font-semibold data-[selected]:text-[var(--accent-contrast)] data-[focused]:ring-2 data-[focused]:ring-[var(--accent-ring)]"
                  />
                )}
              </CalendarGridBody>
            </CalendarGrid>
          </Calendar>
        </Dialog>
      </Popover>
    </AriaDatePicker>
  );
}
