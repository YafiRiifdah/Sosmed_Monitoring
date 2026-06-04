import { DownloadCloud, Play, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../Button";

type Props = {
  onRunJob: (kind: "discover" | "engagement" | "score") => void;
};

export function OverviewHeader({ onRunJob }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text)] tracking-wide">
          Overview
        </h1>
      </div>

      <div className="flex flex-wrap gap-2">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            icon={<DownloadCloud size={16} />}
            variant="ghost"
            onClick={() => onRunJob("discover")}
          >
            Discover
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            icon={<Play size={16} />}
            variant="ghost"
            onClick={() => onRunJob("engagement")}
          >
            Fetch
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            icon={<RefreshCw size={16} />}
            onClick={() => onRunJob("score")}
          >
            Score
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
