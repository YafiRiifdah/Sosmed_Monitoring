export function EmptyState({ message }: { message: string }) {
  return <div className="rounded-md border border-dashed border-line bg-white p-6 text-center text-sm text-slate-500">{message}</div>;
}
