export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-8 text-center text-sm text-[var(--text-subtle)]">
      {message}
    </div>
  );
}

