"use client";

import Link from "next/link";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export function Footer() {
  return (
    <footer className="relative border-t border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
      {/* Accent gradient strip */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent opacity-60" aria-hidden />

      {/* Metrics strip */}
      <div className="border-b border-[var(--border)] py-8">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-wrap justify-center gap-x-16 gap-y-6 text-center">
          <div>
            <p className="font-display text-2xl sm:text-3xl font-bold text-white">
              <AnimatedCounter value={4290} suffix="+" duration={1} />
            </p>
            <p className="text-[var(--text-secondary)] text-sm mt-1">Matches made</p>
          </div>
          <div>
            <p className="font-display text-2xl sm:text-3xl font-bold text-white">
              <AnimatedCounter value={0} suffix="%" duration={1} />
            </p>
            <p className="text-[var(--text-secondary)] text-sm mt-1">Bias in filtering</p>
          </div>
          <div>
            <p className="font-display text-2xl sm:text-3xl font-bold text-white">2.3x</p>
            <p className="text-[var(--text-secondary)] text-sm mt-1">Faster hires</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
        {/* Final CTA block */}
        <div className="glass-card relative p-10 sm:p-14 mb-20 text-center">
          <h3 className="font-display text-[clamp(1.5rem, 3vw, 2.25rem)] font-bold text-white tracking-tight mb-4" style={{ letterSpacing: "-0.02em" }}>
            Start your next chapter today
          </h3>
          <p className="text-[var(--text-secondary)] text-[1.125rem] max-w-xl mx-auto mb-8" style={{ lineHeight: 1.7 }}>
            Join candidates and employers who find the right fit faster.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/signup/candidate" className="btn-primary btn-magnetic shine-hover inline-flex">
              I&apos;m a candidate
            </Link>
            <Link href="/signup/employer" className="btn-ghost shine-hover inline-flex">
              I&apos;m an employer
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-14 md:gap-20 items-start">
          <div className="col-span-2 md:col-span-1">
            <p className="font-display font-bold text-white text-[1.25rem] tracking-tight mb-5">
              Recruiter<span className="text-[var(--accent-primary)]">.</span>Solutions
            </p>
            <p className="text-[1rem] text-[var(--text-secondary)] leading-relaxed max-w-[280px]" style={{ lineHeight: 1.7 }}>
              Where talent meets opportunity. AI-powered matching, one platform.
            </p>
          </div>
          <div>
            <p className="font-display text-[11px] uppercase tracking-[0.25em] text-[var(--text-secondary)] mb-5 font-semibold">
              Candidates
            </p>
            <ul className="space-y-4 text-[1rem]">
              <li><Link href="/jobs" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors link-underline duration-300">Browse jobs</Link></li>
              <li><Link href="/signup/candidate" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors link-underline duration-300">Sign up</Link></li>
              <li><Link href="/dashboard/candidate" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors link-underline duration-300">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-display text-[11px] uppercase tracking-[0.25em] text-[var(--text-secondary)] mb-5 font-semibold">
              Employers
            </p>
            <ul className="space-y-4 text-[1rem]">
              <li><Link href="/signup/employer" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors link-underline duration-300">Post a job</Link></li>
              <li><Link href="/dashboard/employer" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors link-underline duration-300">Dashboard</Link></li>
              <li><Link href="/pricing" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors link-underline duration-300">Pricing</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest">
            © {new Date().getFullYear()} Recruiter.Solutions
          </p>
          <div className="flex flex-wrap gap-8 text-xs text-[var(--text-secondary)] uppercase tracking-widest">
            <Link href="/terms" className="hover:text-[var(--accent-primary)] transition-colors duration-200">Terms</Link>
            <Link href="/privacy" className="hover:text-[var(--accent-primary)] transition-colors duration-200">Privacy</Link>
            <Link href="/cookies" className="hover:text-[var(--accent-primary)] transition-colors duration-200">Cookies</Link>
            <Link href="/acceptable-use" className="hover:text-[var(--accent-primary)] transition-colors duration-200">Acceptable use</Link>
            <Link href="/contact" className="hover:text-[var(--accent-primary)] transition-colors duration-200">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
