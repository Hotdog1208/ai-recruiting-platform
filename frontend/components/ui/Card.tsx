"use client";

import { motion } from "framer-motion";

export function Card({
  children,
  className = "",
  hover,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -8, scale: 1.01 } : {}}
      className={`${hover ? "card-interactive cursor-pointer" : "card-premium"} p-6 relative overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
