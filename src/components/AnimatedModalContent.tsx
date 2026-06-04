import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

const modalContentVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    filter: "blur(6px)",
  },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "tween",
      ease: [0.16, 1, 0.3, 1],
      duration: 0.45,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 12,
    filter: "blur(4px)",
    transition: {
      duration: 0.25,
      ease: "easeInOut",
    },
  },
};

export function AnimatedModalContent({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={modalContentVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="w-full origin-center"
    >
      {children}
    </motion.div>
  );
}
