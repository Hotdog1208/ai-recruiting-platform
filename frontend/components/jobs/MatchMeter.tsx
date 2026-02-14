"use client";

import { motion } from "framer-motion";

/** Animated match score meter (0–100). Signature interaction. */
export function MatchMeter({ score, label = "match" }: { score: number; label?: string }) {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-[var(--border-strong)] overflow-hidden" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
        <motion.div
          className="h-full rounded-full bg-[var(--accent)]"
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        />
      </div>
      <span className="text-xs font-medium text-[var(--text-muted)] tabular-nums">{clamped}% {label}</span>
    </div>
  );
}
