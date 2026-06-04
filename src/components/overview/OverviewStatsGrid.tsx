import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card } from "../Card";
import { Skeleton } from "../Skeleton";
import { containerVariants, itemVariants } from "./overviewAnimations";

export type OverviewStatCard = {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone: string;
};

type Props = {
  cards: OverviewStatCard[];
  loading: boolean;
};

export function OverviewStatsGrid({ cards, loading }: Props) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Skeleton variant="card" count={6} />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      {cards.map((card) => (
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          key={card.label}
        >
          <Card className="h-full transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[var(--text-subtle)]">
                  {card.label}
                </div>
                <div className="mt-2 text-3xl font-bold text-[var(--text)] tracking-tight">
                  {card.value}
                </div>
              </div>

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-muted)] ${card.tone}`}
              >
                {card.icon}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
