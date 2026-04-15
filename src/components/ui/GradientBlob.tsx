"use client";

import { motion } from "framer-motion";

interface GradientBlobProps {
  className?: string;
  color?: "green" | "sage" | "lavender" | "warm";
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

const colorMap = {
  green: "from-amber-200/30 via-orange-100/20 to-yellow-200/10",
  sage: "from-stone-200/25 via-amber-100/15 to-orange-200/10",
  lavender: "from-purple-200/20 via-violet-100/15 to-indigo-200/10",
  warm: "from-amber-200/20 via-orange-100/15 to-yellow-200/10",
};

const darkColorMap = {
  green: "dark:from-amber-800/15 dark:via-orange-900/10 dark:to-yellow-900/5",
  sage: "dark:from-stone-800/12 dark:via-amber-900/8 dark:to-orange-900/5",
  lavender: "dark:from-purple-800/12 dark:via-violet-900/8 dark:to-indigo-900/5",
  warm: "dark:from-amber-800/12 dark:via-orange-900/8 dark:to-yellow-900/5",
};

const sizeMap = {
  sm: "w-[300px] h-[300px]",
  md: "w-[500px] h-[500px]",
  lg: "w-[700px] h-[700px]",
};

export default function GradientBlob({
  className = "",
  color = "sage",
  size = "md",
  animate = true,
}: GradientBlobProps) {
  return (
    <motion.div
      initial={animate ? { opacity: 0, scale: 0.8 } : undefined}
      whileInView={animate ? { opacity: 1, scale: 1 } : undefined}
      viewport={{ once: true }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className={`absolute rounded-full bg-gradient-to-br ${colorMap[color]} ${darkColorMap[color]} ${sizeMap[size]} blur-3xl pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}
