"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { TiltCard } from "@/components/ui/TiltCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const fadeUp = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const MARQUEE_ITEMS = [
  "Deep Vector Matching",
  "O(1) Similarity Search",
  "Bias-Free AI",
  "Seamless Candidate Experience",
  "Zero-Trust Security",
  "Automated Resume Parsing",
  "Premium ATS Integrated",
  "✦",
  "Find your perfect fit",
  "Hire in milliseconds",
  "✦",
];

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { scrollYProgress } = useScroll();
  const yHeroText = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const yHeroVisual = useTransform(scrollYProgress, [0, 1], [0, -100]);

  useEffect(() => {
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
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

      <main className="flex-1 overflow-hidden">
        {/* HERO SECTION - Jaw Dropping Aesthetics */}
        <section className="relative min-h-[100vh] flex flex-col justify-center overflow-hidden hero-bg">
          <div className="noise-overlay-hero" aria-hidden />
          
          <div className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-8 items-center max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-0 w-full z-10">
            <motion.div style={{ y: yHeroText }} className="hero-content-wrap w-full pr-0 md:pr-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-primary)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-primary)]"></span>
                </span>
                <span className="text-sm font-semibold tracking-wider uppercase text-[var(--accent-primary)]">Next-Gen AI Recruiting Engine</span>
              </motion.div>

              <h1 className="text-white font-display text-[clamp(3.5rem,8vw,6.5rem)] font-extrabold leading-[0.9] tracking-tighter mb-8 mix-blend-plus-lighter">
                Hire the <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-primary)] via-[#fff] to-[var(--accent-secondary)] drop-shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                  Impossible.
                </span>
              </h1>
              
              <motion.p
                className="text-[var(--text-secondary)] text-[clamp(1.1rem,1.5vw,1.3rem)] leading-relaxed max-w-xl mb-12 font-medium"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                Zero-friction matching powered by an asynchronous 1536-dimensional vector database. Upload a resume, instantly find the perfect fit.
              </motion.p>
              
              <motion.form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row gap-4 max-w-xl mb-10"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Job title, keywords, or company"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl text-lg"
                  />
                </div>
                <MagneticButton strength={0.2} className="shrink-0">
                  <button type="submit" className="btn-primary w-full sm:w-auto h-full min-h-[60px] text-lg font-bold rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.2)]">
                    Explore
                  </button>
                </MagneticButton>
              </motion.form>
              
              <motion.div
                className="flex flex-wrap gap-4 items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <Link href="/signup/candidate" className="text-gray-400 hover:text-white transition-colors text-sm font-semibold tracking-wide border-b border-white/10 hover:border-[var(--accent-primary)] pb-1">
                  I AM A CANDIDATE
                </Link>
                <span className="text-gray-700 font-bold">•</span>
                <Link href="/signup/employer" className="text-gray-400 hover:text-white transition-colors text-sm font-semibold tracking-wide border-b border-white/10 hover:border-[var(--accent-secondary)] pb-1">
                  I AM AN EMPLOYER
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Side UI Visualization */}
            <motion.div style={{ y: yHeroVisual }} className="hidden lg:block relative h-full min-h-[600px] perspective-1000">
              <motion.div 
                className="absolute right-0 top-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-[var(--accent-primary)]/10 via-[var(--accent-secondary)]/10 to-transparent blur-3xl rounded-full"
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              
              <TiltCard className="absolute right-10 top-20 w-[420px] z-20" maxTilt={8}>
                <div className="card-interactive p-6 border-white/10 bg-black/40 backdrop-blur-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#0084ff] p-[2px]">
                      <div className="w-full h-full bg-black rounded-full overflow-hidden">
                        <Image src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Profile" width={56} height={56} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg leading-tight">Sarah Jenkins</h3>
                      <p className="text-[var(--accent-primary)] text-sm font-medium">98.2% AI Vector Match</p>
                    </div>
                    <div className="ml-auto flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)]/50" />
                      <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)]/20" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]" initial={{ width: "0%" }} animate={{ width: "98%" }} transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 font-medium">
                      <span>Python</span>
                      <span>1536-Dimensional Matrix Processed</span>
                      <span>FastAPI</span>
                    </div>
                  </div>
                </div>
              </TiltCard>

              <TiltCard className="absolute right-32 bottom-20 w-[380px] z-10" maxTilt={12}>
                <div className="card-interactive p-6 border-white/5 bg-black/60 backdrop-blur-3xl shadow-2xl">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--accent-secondary)]/20 flex items-center justify-center text-[var(--accent-secondary)]">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold bg-white/5 px-3 py-1 rounded-full border border-white/10">Just Posted</span>
                  </div>
                  <h4 className="text-white font-bold text-xl mb-1">Senior Lead Backend Eng.</h4>
                  <p className="text-gray-400 text-sm mb-4">Anthropic • San Francisco, CA</p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/5 text-gray-300 text-xs font-semibold border border-white/5">Python</span>
                    <span className="px-3 py-1 rounded-full bg-white/5 text-gray-300 text-xs font-semibold border border-white/5">Async</span>
                    <span className="px-3 py-1 rounded-full bg-white/5 text-gray-300 text-xs font-semibold border border-white/5">Vector DB</span>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          </div>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center text-white/50 animate-bounce cursor-pointer flex flex-col items-center">
            <span className="text-[10px] tracking-widest uppercase mb-2 font-bold">Discover</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </section>

        {/* Marquee Banner */}
        <section className="bg-[var(--accent-primary)]/10 border-y border-[var(--accent-primary)]/20 py-5 overflow-hidden backdrop-blur-md relative z-10">
          <div className="flex w-full marquee-inner shadow-[0_0_30px_rgba(0,240,255,0.1)]">
            <div className="flex gap-16 shrink-0 pr-16 items-center">
              {MARQUEE_ITEMS.map((item, i) => (
                <span key={`a-${i}`} className={`font-display text-sm uppercase tracking-[0.3em] font-extrabold ${item === "✦" ? "text-white" : "text-[var(--accent-primary)]"}`}>
                  {item}
                </span>
              ))}
            </div>
            <div className="flex gap-16 shrink-0 pr-16 items-center">
              {MARQUEE_ITEMS.map((item, i) => (
                <span key={`b-${i}`} className={`font-display text-sm uppercase tracking-[0.3em] font-extrabold ${item === "✦" ? "text-white" : "text-[var(--accent-primary)]"}`}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Cinematic Step Section */}
        <section className="py-32 px-6 lg:px-12 relative">
          <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
          <div className="max-w-[1400px] mx-auto">
            <ScrollReveal>
              <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
                <div className="max-w-3xl">
                  <h2 className="text-white font-display text-[clamp(2.5rem,5vw,4rem)] font-extrabold tracking-tighter leading-tight mb-6">
                    Three Steps. <br /> Zero Noise.
                  </h2>
                  <p className="text-gray-400 text-xl font-medium max-w-xl">
                    We eliminated the legacy ATS tracking bloat. Upload your pdf, we calculate the dense embedding matrix, and match you to jobs in O(1) time complexity.
                  </p>
                </div>
                <MagneticButton strength={0.3}>
                  <Link href="/signup" className="flex items-center gap-3 text-white font-bold bg-white/5 hover:bg-white/10 border border-white/20 px-8 py-4 rounded-full transition-all">
                    Get Started <span className="text-[var(--accent-primary)]">→</span>
                  </Link>
                </MagneticButton>
              </div>
            </ScrollReveal>

            <motion.div 
              className="grid lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.1 }}
            >
              {[
                { num: "01", title: "Upload & Parse", desc: "Drop any resume. Our AI natively rips text via magic-bytes validation.", color: "from-[#00f0ff] to-[#0084ff]" },
                { num: "02", title: "Compute Identity", desc: "We hash your expertise into a 1536-dimensional hyper-vector constraint array.", color: "from-[#7a00ff] to-[#ff007a]" },
                { num: "03", title: "Cosine Match", desc: "Postgres pgvector instantly searches the absolute best mathematically fitting companies.", color: "from-[#00ff87] to-[#00f0ff]" }
              ].map((s) => (
                <motion.div key={s.num} variants={fadeUp}>
                  <TiltCard maxTilt={5}>
                    <div className="card-interactive min-h-[380px] p-10 flex flex-col justify-between group overflow-hidden relative">
                      <div className={`absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br ${s.color} rounded-full blur-[80px] opacity-0 group-hover:opacity-30 transition-opacity duration-700`} />
                      
                      <div className="font-display text-[4rem] font-black text-white/5 self-end transition-colors group-hover:text-white/10 line-height-1">
                        {s.num}
                      </div>
                      
                      <div>
                        <div className={`w-12 h-1 mb-8 bg-gradient-to-r ${s.color} rounded-full`} />
                        <h3 className="text-white font-display text-2xl font-bold mb-4 tracking-tight">{s.title}</h3>
                        <p className="text-gray-400 leading-relaxed font-medium">{s.desc}</p>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Global Impact Platform Metrics */}
        <section className="py-32 border-y border-[var(--border)] relative bg-black/50 backdrop-blur-lg">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row gap-20 items-center">
            
            <div className="flex-1 w-full grid grid-cols-2 gap-4">
              {[
                { stat: "98.7%", label: "Placement Accuracy" },
                { stat: "15ms", label: "Average Match Time" },
                { stat: "0%", label: "Gender/Race Bias" },
                { stat: "O(1)", label: "Query Complexity" },
              ].map((s, i) => (
                <ScrollReveal key={s.label} delay={i * 0.1}>
                  <div className="card-sharp flex flex-col justify-center items-center text-center p-10 h-full">
                    <h4 className="text-[var(--accent-primary)] font-display text-4xl lg:text-5xl font-black mb-3 drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">{s.stat}</h4>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{s.label}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <div className="flex-1 max-w-xl">
              <ScrollReveal>
                <div className="inline-block px-4 py-2 bg-[var(--accent-secondary)]/10 border border-[var(--accent-secondary)]/30 rounded-full text-[var(--accent-secondary)] text-sm font-bold tracking-widest mb-6">
                  ENGINEERING SUPERIORITY
                </div>
                <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] text-white font-black leading-[1.1] tracking-tighter mb-8">
                  Built for Mechanical Sympathy.
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-10 font-medium">
                  We don&apos;t use basic text search. By combining Asynchronous PostgreSQL bindings (`asyncpg`) with C-compiled Native Vector extensions (`pgvector`), we execute deep Cosine Similarity algorithms at the absolute hardware limit.
                </p>
                <MagneticButton strength={0.2}>
                  <Link href="/jobs" className="btn-primary w-fit font-bold tracking-wide">
                    Experience The Speed
                  </Link>
                </MagneticButton>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Immersive CTA */}
        <section className="relative py-40 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[var(--accent-primary)]/5" />
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] aspect-square bg-[var(--accent-secondary)]/20 rounded-full blur-[120px] mix-blend-screen"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          
          <ScrollReveal amount={0.3}>
            <div className="relative z-10 text-center px-6 max-w-4xl mx-auto backdrop-blur-sm p-12 rounded-3xl border border-white/5 bg-black/20 shadow-2xl">
              <h2 className="font-display text-white text-[clamp(3rem,6vw,5rem)] font-black tracking-tighter leading-none mb-8">
                Stop <span className="text-[var(--text-secondary)]">Searching.</span><br/>
                Start <span className="text-[var(--accent-primary)] drop-shadow-[0_0_20px_rgba(0,240,255,0.4)]">Matching.</span>
              </h2>
              <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
                <MagneticButton strength={0.4}>
                  <Link href="/signup/candidate" className="btn-primary px-12 py-5 text-lg font-extrabold w-full sm:w-auto text-center hover:scale-105 transition-transform duration-300 shadow-[0_0_30px_rgba(0,240,255,0.3)]">
                    CANDIDATES
                  </Link>
                </MagneticButton>
                <MagneticButton strength={0.4}>
                  <Link href="/signup/employer" className="btn-ghost px-12 py-5 text-lg font-extrabold w-full sm:w-auto text-center hover:bg-white/5 hover:border-white transition-all backdrop-blur-md">
                    EMPLOYERS
                  </Link>
                </MagneticButton>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
