"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,var(--accent-dim),transparent)] pointer-events-none" aria-hidden />
        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-sm font-medium text-[var(--accent)] tracking-wider uppercase mb-2">Error 404</p>
          <h1 className="font-display text-display text-5xl sm:text-6xl md:text-7xl text-white tracking-tight">Page not found</h1>
          <p className="mt-4 text-[var(--text-muted)] max-w-sm mx-auto">
            The page you’re looking for doesn’t exist or was moved.
          </p>
          <Link href="/" className="mt-8 btn-primary btn-magnetic inline-flex items-center rounded-xl">
            Go home
          </Link>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
