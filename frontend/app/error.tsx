"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(20,184,166,0.06),transparent)] pointer-events-none" aria-hidden />
      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-sm font-medium text-teal-400/80 tracking-wider uppercase mb-2">Error</p>
        <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight">Something went wrong</h1>
        <p className="mt-4 text-zinc-400 max-w-sm mx-auto">
          We’ve been notified. Please try again or go back home.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
          >
            Go home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
