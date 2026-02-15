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

const TESTIMONIALS = [
  { quote: "Finally a platform that matches me to roles I actually want. The fit scores save so much time.", author: "Candidate" },
  { quote: "We hired twice as fast. The AI shortlist is surprisingly accurate.", author: "Hiring manager" },
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
        {/* Hero: one viewport below nav, gradient orbs + noise */}
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
            {/* Hero visual: gradient orb + illustration (desktop right, mobile below) */}
            <motion.div
              className="hero-visual relative flex lg:hidden items-center justify-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-full max-w-sm mx-auto relative aspect-[400/220]">
                <Image src="/illustrations/hero.svg" alt="" className="object-contain opacity-90" fill sizes="(max-width: 1024px) 400px, 400px" priority unoptimized />
              </div>
            </motion.div>
            <motion.div
              className="hero-visual relative hidden lg:flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="absolute w-[400px] h-[400px] rounded-full bg-[var(--accent-primary)]/20 blur-[100px] animate-float" aria-hidden />
              <div className="absolute w-[280px] h-[280px] rounded-full bg-[var(--accent-secondary)]/10 blur-[80px] animate-float" style={{ animationDelay: "1.5s" }} aria-hidden />
              <div className="relative z-10 w-full max-w-md aspect-[480/280]">
                <Image src="/illustrations/hero.svg" alt="" className="object-contain opacity-95 drop-shadow-2xl" fill sizes="(min-width: 1024px) 480px, 0px" unoptimized />
              </div>
            </motion.div>
          </div>
          {/* Scroll indicator – animated arrow only */}
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

        {/* Stats — label / value / description, no overlap */}
        <ScrollReveal amount={0.2}>
          <section className="stats-section fade-in-section relative border-b border-[var(--border)]">
            <div className="stats-marquee max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
              {[
                { value: "AI", label: "Smart matching", desc: "Smart matching" },
                { value: 0, label: "Zero bias", desc: "Bias in filtering", numeric: true, suffix: "%" },
                { value: "1-Click", label: "One platform", desc: "Resume parsing" },
                { value: "∞", label: "Trusted", desc: "Job sources" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  className="stat-item group cursor-default"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ scale: 1.03 }}
                >
                  <p className="stat-label">{item.label}</p>
                  <p className="stat-value font-display text-[2.5rem] sm:text-[3rem] font-bold text-white group-hover:text-[var(--accent-primary)] transition-colors duration-300 tracking-tight">
                    {item.numeric && typeof item.value === "number" ? (
                      <AnimatedCounter value={item.value} suffix={item.suffix} duration={1} />
                    ) : (
                      item.value
                    )}
                  </p>
                  <p className="stat-description">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* How it works — glass cards */}
        <section className="how-it-works fade-in-section py-16 sm:py-24 px-6 sm:px-8 lg:px-12 border-b border-[var(--border)] section-noise relative">
          <div className="max-w-6xl mx-auto relative">
            <ScrollReveal delay={0.05}>
              <p className="font-display text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)] mb-4 font-semibold">
                How it works
              </p>
              <h2 className="section-heading font-display max-w-2xl mb-4">
                Three steps to your next role
              </h2>
              <p className="text-[var(--text-secondary)] section-subtitle text-left max-w-xl mb-12">
                No forms. No guesswork. Just upload, match, and apply.
              </p>
            </ScrollReveal>
            <div className="steps-grid cards-grid grid md:grid-cols-3 gap-6 md:gap-8 mb-16 items-stretch">
              {HOW_IT_WORKS.map((step, i) => (
                <ScrollReveal key={step.step} delay={i * 0.1} amount={0.2}>
                  <div className="step-card card feature-card glass-card relative p-10 group h-full flex flex-col">
                    <span className="step-number card-number font-display text-2xl">
                      {step.step}
                    </span>
                    <h3 className="step-title card-title font-display text-[1.5rem] font-semibold text-white mt-4 mb-3 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="step-description card-description text-[var(--text-secondary)] text-[1.0625rem] leading-relaxed">{step.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            <ScrollReveal amount={0.15}>
              <div className="glass-card relative p-8 sm:p-12 flex justify-center">
                <div className="w-full max-w-md relative aspect-[400/240]">
                  <Image src="/illustrations/hero.svg" alt="" className="object-contain opacity-90" fill sizes="400px" unoptimized />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Why us — bento glass */}
        <section className="py-16 sm:py-24 px-6 sm:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <p className="font-display text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)] mb-4 font-semibold">
                Why us
              </p>
              <h2 className="section-heading font-display max-w-2xl mb-12">
                Built for how you work
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
              {WHY_ITEMS.map((item, i) => (
                <ScrollReveal key={item.label} delay={i * 0.06} amount={0.2}>
                  <div className="glass-card relative p-8 group h-full flex items-center">
                    <p className="font-display text-display-sm text-white group-hover:text-[var(--accent-primary)] transition-colors text-[1.125rem]">
                      {item.label}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Features — 3D tilt + glass */}
        <section className="py-16 sm:py-24 px-6 sm:px-8 lg:px-12 border-t border-[var(--border)] section-noise relative">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <p className="font-display text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)] mb-4 font-semibold">
                The product
              </p>
              <h2 className="section-heading font-display max-w-2xl mb-12">
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
                    <div className="glass-card relative p-10 h-full shine-hover">
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
                      <h3 className="font-display text-[1.35rem] font-semibold text-white mb-4 tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="text-[var(--text-secondary)] text-[1.0625rem] leading-relaxed">{feature.desc}</p>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 sm:py-24 px-6 sm:px-8 lg:px-12 border-y border-[var(--border)]">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <p className="font-display text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)] mb-4 font-semibold">
                What people say
              </p>
              <h2 className="section-heading font-display max-w-2xl mb-10">
                Trusted by candidates and employers
              </h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 gap-8 items-stretch">
              {TESTIMONIALS.map((t, i) => (
                <ScrollReveal key={i} delay={i * 0.1} amount={0.2}>
                  <blockquote className="glass-card relative p-10">
                    <p className="text-[var(--text-primary)] text-[1.25rem] leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                    <footer className="mt-6 text-[1rem] text-[var(--text-secondary)] font-medium">— {t.author}</footer>
                  </blockquote>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA — centered, final punch */}
        <section className="cta-section fade-in-section py-16 sm:py-24 px-6 sm:px-8 lg:px-12 hero-bg section-noise relative">
          <ScrollReveal amount={0.2}>
            <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
              <h2 className="cta-title section-heading font-display">
                Ready to find your fit?
              </h2>
              <p className="cta-subtitle text-[var(--text-secondary)]">
                Create a free account. Upload your resume. Get matched.
              </p>
              <div className="cta-buttons">
                <Link href="/signup" className="cta-button-primary btn-primary btn-magnetic shine-hover">
                  Create free account
                </Link>
                <Link href="/jobs" className="cta-button-secondary btn-ghost link-underline">
                  Browse jobs
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
