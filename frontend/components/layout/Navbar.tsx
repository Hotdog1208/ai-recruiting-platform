"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold text-white tracking-tight">
          Recruiter<span className="text-teal-400">.Solutions</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/jobs" className="px-4 py-2 text-zinc-400 hover:text-white font-medium text-sm transition-colors">
            Jobs
          </Link>
          <Link href="/how-it-works" className="hidden sm:inline px-4 py-2 text-zinc-400 hover:text-white font-medium text-sm transition-colors">
            How it works
          </Link>
          <Link href="/pricing" className="hidden sm:inline px-4 py-2 text-zinc-400 hover:text-white font-medium text-sm transition-colors">
            Pricing
          </Link>
          <Link href="/login" className="px-4 py-2 text-zinc-400 hover:text-white font-medium text-sm transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="px-4 py-2 bg-teal-500 text-black rounded-lg hover:bg-teal-400 font-semibold text-sm transition-all shadow-lg shadow-teal-500/20">
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}
