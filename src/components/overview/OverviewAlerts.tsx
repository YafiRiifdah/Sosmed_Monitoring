import { AnimatePresence, motion } from "framer-motion";

type Props = {
  error?: string | null;
  jobMessage?: string | null;
};

export function OverviewAlerts({ error, jobMessage }: Props) {
  return (
    <AnimatePresence mode="popLayout">
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0, scale: 0.95 }}
          animate={{ opacity: 1, height: "auto", scale: 1 }}
          exit={{ opacity: 0, height: 0, scale: 0.95 }}
          className="rounded-md border border-[color-mix(in_srgb,var(--danger)_22%,transparent)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)] overflow-hidden"
        >
          {error}
        </motion.div>
      )}

      {jobMessage && (
        <motion.div
          initial={{ opacity: 0, height: 0, scale: 0.95 }}
          animate={{ opacity: 1, height: "auto", scale: 1 }}
          exit={{ opacity: 0, height: 0, scale: 0.95 }}
          className="rounded-md border border-[var(--accent-ring)] bg-[var(--accent-soft)] p-3 text-sm text-[var(--accent)] overflow-hidden"
        >
          {jobMessage}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
