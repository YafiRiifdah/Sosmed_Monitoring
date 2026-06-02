import type { ReactNode, ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { buttonVariants } from "./ui/button";
import { cn } from "../lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  variant?: "primary" | "ghost" | "danger";
};

export function Button({ icon, children, variant = "primary", className = "", ...props }: Props) {
  return (
    <motion.button
      whileHover={props.disabled ? undefined : { scale: 1.02 }}
      whileTap={props.disabled ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={cn(buttonVariants({ variant }), className)}
      {...(props as any)}
    >
      {icon}
      {children}
    </motion.button>
  );
}


