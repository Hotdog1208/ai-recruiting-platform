"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { TiltCard } from "@/components/ui/TiltCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PlatformMetrics } from "@/components/home/PlatformMetrics";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
};

const stagger = {
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
};

const MARQUEE_ITEMS = [
  "Smart matching",
  "Resume parsing",
  "One platform",
  "Zero bias",
  "AI-powered",
  "Trusted by candidates",
  "Trusted by employers",
  "•",
  "Find your fit",
  "Hire faster",
  "•",
];

const HOW_IT_WORKS = [
  { step: "01", title: "Sign up & upload", desc: "Create your free account. Drop your resume—AI extracts skills and experience in seconds.", icon: "upload" },
  { step: "02", title: "Get matched", desc: "Every job shows a fit score and why you match. No guessing.", icon: "match" },
  { step: "03", title: "Apply in one click", desc: "Save jobs, apply directly, and track everything from one dashboard.", icon: "apply" },
];

const WHY_ITEMS = [
  { label: "Bias-free filtering", icon: "scale" },
  { label: "One search, many sources", icon: "globe" },
  { label: "Resume parsing", icon: "doc" },
  { label: "Match scores", icon: "percent" },
  { label: "Saved jobs", icon: "heart" },
  { label: "Dashboard", icon: "grid" },
];

const HERO_LINES = [
  { text: "Where talent", accent: false },
  { text: "meets", accent: true },
  { text: "opportunity", accent: false },
];

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const observerOptions = { threshold: 0.15, rootMargin: "0px 0px -100px 0px" };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    }, observerOptions);
    document.querySelectorAll(".fade-in-section").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/jobs?q=${encodeURIComponent(search.trim())}`);
    } else {
      router.push("/jobs");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative min-h-[calc(100svh-6.25rem)] flex flex-col justify-center overflow-hidden hero-bg section-noise">
          <div className="hero-orb hero-orb-1" aria-hidden />
          <div className="hero-orb hero-orb-2" aria-hidden />
          <div className="hero-orb hero-orb-3" aria-hidden />
          <div className="noise-overlay-hero" aria-hidden />
          <div className="hero relative grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 lg:py-14 w-full">
            <div className="hero-content hero-content-wrap w-full max-w-2xl pl-0 lg:pl-8">
              <motion.p
                className="hero-tag-badge hero-badge font-body"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                AI-powered recruiting
              </motion.p>
              <h1 className="hero-title text-[var(--text-primary)] mb-[var(--space-hero-gap)]">
                {HERO_LINES.map((line, i) => (
                  <motion.span
                    key={line.text}
                    className="block overflow-hidden"
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className={`block ${line.accent ? "text-[var(--accent-primary)]" : ""}`}>
                      {line.text}
                    </span>
                  </motion.span>
                ))}
              </h1>
              <motion.p
                className="hero-subtitle mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                Upload your resume. Get matched to roles that fit. One platform, many sources—designed for how you work.
              </motion.p>
              <motion.form
                onSubmit={handleSearch}
                className="search-container search-form flex flex-col sm:flex-row gap-3 max-w-xl mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input flex-1 px-5 rounded-xl border text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none transition-all text-[1rem]"
                />
                <MagneticButton strength={0.12} className="shrink-0">
                  <button type="submit" className="search-button btn-primary btn-magnetic px-8 w-full sm:w-auto text-[0.9375rem]">
                    Search jobs
                  </button>
                </MagneticButton>
              </motion.form>
              <motion.div
                className="hero-cta role-selector flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link href="/signup/candidate" className="role-button btn-primary btn-magnetic shine-hover">
                  I&apos;m a candidate
                </Link>
                <Link href="/signup/employer" className="role-button btn-ghost shine-hover">
                  I&apos;m an employer
                </Link>
              </motion.div>
            </div>
            <motion.div
              className="hero-visual relative flex lg:hidden items-center justify-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className="w-full max-w-sm mx-auto relative aspect-[400/220]">
                <Image src="/illustrations/hero.svg" alt="" className="object-contain opacity-90" fill sizes="400px" priority unoptimized />
              </div>
            </motion.div>
            <motion.div
              className="hero-visual relative hidden lg:flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <div className="absolute w-[400px] h-[400px] rounded-full bg-[var(--accent-primary)]/20 blur-[100px] animate-float" aria-hidden />
              <div className="absolute w-[280px] h-[280px] rounded-full bg-[var(--accent-secondary)]/10 blur-[80px] animate-float" style={{ animationDelay: "1.5s" }} aria-hidden />
              <div className="relative z-10 w-full max-w-md aspect-[480/280]">
                <Image src="/illustrations/hero.svg" alt="" className="object-contain opacity-95 drop-shadow-2xl" fill sizes="480px" unoptimized />
              </div>
            </motion.div>
          </div>
          <div className="scroll-indicator" aria-hidden>
            <span className="scroll-indicator-text">Scroll</span>
            <div className="scroll-indicator-arrow" />
          </div>
        </section>

        {/* Marquee */}
        <section className="border-y border-[var(--border)] py-4 overflow-hidden" aria-hidden>
          <div className="flex w-full marquee-inner" style={{ width: "max-content" }}>
            <div className="flex gap-16 shrink-0 pr-16">
              {MARQUEE_ITEMS.map((item, i) => (
                <span key={`a-${i}`} className="font-body text-xs text-[var(--text-secondary)] uppercase tracking-[0.25em] whitespace-nowrap font-medium">
                  {item}
                </span>
              ))}
            </div>
            <div className="flex gap-16 shrink-0 pr-16">
              {MARQUEE_ITEMS.map((item, i) => (
                <span key={`b-${i}`} className="font-body text-xs text-[var(--text-secondary)] uppercase tracking-[0.25em] whitespace-nowrap font-medium">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <ScrollReveal amount={0.2}>
          <section className="stats-section fade-in-section relative border-b border-[var(--border)]">
            <div className="stats-marquee max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
              {[
                { value: 4290, suffix: "+", label: "Matches made", desc: "This year", numeric: true },
                { value: 0, suffix: "%", label: "Zero bias", desc: "In filtering", numeric: true },
                { value: 2.3, suffix: "x", label: "Faster hires", desc: "Vs. traditional", numeric: true, decimals: 1 },
                { value: "1", suffix: "-Click", label: "Apply", desc: "Per job" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  className="stat-item group cursor-default"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <p className="stat-label">{item.label}</p>
                  <p className="stat-value font-display text-[2.5rem] sm:text-[3rem] font-bold text-white group-hover:text-[var(--accent-primary)] transition-colors duration-300 tracking-tight">
                    {item.numeric && typeof item.value === "number" ? (
                      <AnimatedCounter
                        value={item.value}
                        suffix={item.suffix}
                        duration={1}
                        decimals={"decimals" in item ? (item as { decimals?: number }).decimals ?? 0 : 0}
                      />
                    ) : (
                      `${item.value}${item.suffix}`
                    )}
                  </p>
                  <p className="stat-description">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Platform metrics with charts */}
        <PlatformMetrics />

        {/* How it works */}
        <section className="how-it-works fade-in-section py-20 sm:py-28 px-6 sm:px-8 lg:px-12 border-b border-[var(--border)] section-noise relative">
          <div className="max-w-6xl mx-auto relative">
            <ScrollReveal delay={0.05}>
              <p className="font-display text-[11px] uppercase tracking-[0.3em] text-[var(--accent-primary)] mb-4 font-semibold">
                How it works
              </p>
              <h2 className="font-display text-[clamp(1.75rem, 3vw, 2.5rem)] font-bold text-white tracking-tight mb-4" style={{ letterSpacing: "-0.02em" }}>
                Three steps to your next role
              </h2>
              <p className="text-[var(--text-secondary)] text-[1.125rem] max-w-xl mb-16">
                No forms. No guesswork. Just upload, match, and apply.
              </p>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-stretch">
              {HOW_IT_WORKS.map((step, i) => (
                <ScrollReveal key={step.step} delay={i * 0.1} amount={0.2}>
                  <div className="step-card glass-card relative p-10 group h-full flex flex-col rounded-2xl border border-[var(--border)] hover:border-[var(--accent-primary)]/20 transition-colors duration-300">
                    <span className="font-display text-3xl font-bold text-[var(--accent-primary)]/60">{step.step}</span>
                    <h3 className="font-display text-[1.35rem] font-semibold text-white mt-4 mb-3 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-[var(--text-secondary)] text-[1rem] leading-relaxed flex-1">{step.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Why us */}
        <section className="py-20 sm:py-28 px-6 sm:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <p className="font-display text-[11px] uppercase tracking-[0.3em] text-[var(--accent-primary)] mb-4 font-semibold">
                Why us
              </p>
              <h2 className="font-display text-[clamp(1.75rem, 3vw, 2.5rem)] font-bold text-white mb-12 tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                Built for how you work
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
              {WHY_ITEMS.map((item, i) => (
                <ScrollReveal key={item.label} delay={i * 0.06} amount={0.2}>
                  <div className="glass-card relative p-8 rounded-2xl border border-[var(--border)] group h-full flex items-center hover:border-[var(--accent-primary)]/20 transition-colors duration-300">
                    <p className="font-display text-[1.125rem] font-semibold text-white group-hover:text-[var(--accent-primary)] transition-colors">
                      {item.label}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 sm:py-28 px-6 sm:px-8 lg:px-12 border-t border-[var(--border)] section-noise relative">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <p className="font-display text-[11px] uppercase tracking-[0.3em] text-[var(--accent-primary)] mb-4 font-semibold">
                The product
              </p>
              <h2 className="font-display text-[clamp(1.75rem, 3vw, 2.5rem)] font-bold text-white mb-12 tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                One platform. Every step of the hire.
              </h2>
            </ScrollReveal>
            <motion.div
              className="grid md:grid-cols-3 gap-8 items-stretch"
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.15 }}
            >
              {[
                { title: "Upload & parse", desc: "Drop your resume. AI extracts skills and experience in seconds. No forms.", icon: "doc" },
                { title: "AI match score", desc: "Every job gets a fit score and explanation. See why you match before you apply.", icon: "bolt" },
                { title: "One search, many sources", desc: "Platform jobs plus aggregated listings. Browse or get AI recommendations.", icon: "search" },
              ].map((feature) => (
                <motion.div key={feature.title} variants={fadeUp}>
                  <TiltCard maxTilt={6} className="group" glare>
                    <div className="glass-card relative p-10 h-full rounded-2xl border border-[var(--border)] shine-hover">
                      <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary)]/15 flex items-center justify-center mb-8 text-[var(--accent-primary)]">
                        {feature.icon === "doc" && (
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                        {feature.icon === "bolt" && (
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                        {feature.icon === "search" && (
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        )}
                      </div>
                      <h3 className="font-display text-[1.25rem] font-semibold text-white mb-4 tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="text-[var(--text-secondary)] text-[1rem] leading-relaxed">{feature.desc}</p>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <TestimonialsSection />

        {/* Trust strip */}
        <section className="py-10 px-6 sm:px-8 border-y border-[var(--border)]">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-x-12 gap-y-4 text-[var(--text-secondary)] text-sm">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Secure & private
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI-powered matching
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Bias-free filtering
            </span>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section fade-in-section py-20 sm:py-28 px-6 sm:px-8 lg:px-12 hero-bg section-noise relative">
          <ScrollReveal amount={0.2}>
            <div className="flex flex-col items-center w-full max-w-3xl mx-auto text-center">
              <h2 className="cta-title font-display text-[clamp(2rem, 4vw, 3rem)] font-bold text-white tracking-tight mb-4" style={{ letterSpacing: "-0.03em" }}>
                Ready to find your fit?
              </h2>
              <p className="cta-subtitle text-[var(--text-secondary)] text-[1.125rem] mb-10">
                Candidates: upload your resume and get matched. Employers: post jobs and hire smarter. Both sides, one platform.
              </p>
              <div className="cta-buttons flex flex-wrap justify-center gap-4">
                <Link href="/signup" className="cta-button-primary btn-primary btn-magnetic shine-hover px-8 py-4 text-base font-semibold">
                  Create free account
                </Link>
                <Link href="/jobs" className="cta-button-secondary btn-ghost link-underline px-6 py-3">
                  Browse jobs
                </Link>
                <Link href="/signup/employer" className="cta-button-secondary btn-ghost link-underline px-6 py-3">
                  Post a job
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
