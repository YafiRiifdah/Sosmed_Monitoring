import { Plus, Search } from "lucide-react";
import type { FormEvent } from "react";
import type { Account } from "../../types";
import { Button } from "../Button";
import { Checkbox } from "../ui/checkbox";
import { DatePickerField } from "../ui/date-picker";
import { Input } from "../ui/input";
import { CustomSelect } from "../ui/select";

type Props = {
  completionFilter: string;
  dateFrom: string;
  dateTo: string;
  isLimitReached: boolean;
  loading: boolean;
  onlyTracked: boolean;
  onCompletionFilterChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onOnlyTrackedChange: (value: boolean) => void;
  onPostUrlChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  onSubmitTrackPost: (event: FormEvent) => void;
  onTargetAccountIdChange: (value: string) => void;
  onTargetFilterChange: (value: string) => void;
  postUrl: string;
  query: string;
  targetAccountId: string;
  targetFilter: string;
  targets: Account[];
};

export function InstagramPostToolbar({
  completionFilter,
  dateFrom,
  dateTo,
  isLimitReached,
  loading,
  onlyTracked,
  onCompletionFilterChange,
  onDateFromChange,
  onDateToChange,
  onOnlyTrackedChange,
  onPostUrlChange,
  onQueryChange,
  onSubmitTrackPost,
  onTargetAccountIdChange,
  onTargetFilterChange,
  postUrl,
  query,
  targetAccountId,
  targetFilter,
  targets,
}: Props) {
  if (loading) {
    return (
      <>
        <div className="grid gap-3 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 backdrop-blur-xl md:grid-cols-[260px_1fr_auto]">
          <div className="animate-shimmer h-10 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)]" />
          <div className="animate-shimmer h-10 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)]" />
          <div className="animate-shimmer h-10 w-24 rounded-md bg-[var(--surface-muted)]" />
        </div>

        <div className="max-w-md">
          <div className="animate-shimmer h-10 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)]" />
        </div>

        <div className="grid gap-3 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 backdrop-blur-xl md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="animate-shimmer h-10 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)]"
            />
          ))}
          <div className="animate-shimmer h-10 min-w-32 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)]" />
        </div>
      </>
    );
  }

  return (
    <>
      <form
        onSubmit={(event) => onSubmitTrackPost(event)}
        className="grid gap-3 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 backdrop-blur-xl md:grid-cols-[260px_1fr_auto]"
      >
        <CustomSelect
          value={targetAccountId}
          onChange={onTargetAccountIdChange}
          options={targets.map((target) => ({
            value: target.id,
            label: `@${target.username}`,
          }))}
          placeholder="Select target"
          className="w-full"
        />
        <Input
          placeholder="https://www.instagram.com/p/..."
          value={postUrl}
          onChange={(event) => onPostUrlChange(event.target.value)}
          required
        />
        <Button icon={<Plus size={16} />} type="submit" disabled={isLimitReached}>
          Track
        </Button>
      </form>

      <div className="max-w-md">
        <Input
          placeholder="Cari postingan..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          icon={<Search size={17} />}
        />
      </div>

      <div className="grid gap-3 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 backdrop-blur-xl md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <CustomSelect
          value={targetFilter}
          onChange={onTargetFilterChange}
          options={[
            { value: "all", label: "All targets" },
            ...targets.map((target) => ({
              value: target.id,
              label: `@${target.username}`,
            })),
          ]}
          placeholder="All targets"
          className="w-full"
        />
        <CustomSelect
          value={completionFilter}
          onChange={onCompletionFilterChange}
          options={[
            { value: "all", label: "All completion" },
            { value: "zero", label: "0%" },
            { value: "incomplete", label: "Incomplete" },
            { value: "complete", label: "Complete" },
          ]}
          placeholder="All completion"
          className="w-full"
        />
        <DatePickerField
          value={dateFrom}
          onChange={onDateFromChange}
          placeholder="Tanggal mulai"
        />
        <DatePickerField
          value={dateTo}
          onChange={onDateToChange}
          placeholder="Tanggal akhir"
        />
        <Checkbox
          checked={onlyTracked}
          onChange={(event) => onOnlyTrackedChange(event.target.checked)}
          label="Manual Only"
        />
      </div>
    </>
  );
}
