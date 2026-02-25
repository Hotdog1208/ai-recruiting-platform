"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useSpring, useInView, Variants } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { TiltCard } from "@/components/ui/TiltCard";

// Utility for staggered text animations
const StaggeredText = ({ text, className }: { text: string; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  
  const words = text.split(" ");
  
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 * i },
    }),
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
    hidden: {
      opacity: 0,
      y: 40,
      rotateX: -90,
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={`flex flex-wrap ${className}`}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {words.map((word, index) => (
        <motion.span variants={child} key={index} className="mr-[0.25em] inline-block" style={{ transformOrigin: "bottom" }}>
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { scrollYProgress } = useScroll();
  
  // Smooth out scroll progress
  const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 100 });
  
  // Parallax effects
  const yHeroText = useTransform(smoothProgress, [0, 1], [0, 400]);
  const yHeroVisual = useTransform(smoothProgress, [0, 1], [0, -200]);
  const opacityHero = useTransform(smoothProgress, [0, 0.2], [1, 0]);
  const scaleHero = useTransform(smoothProgress, [0, 0.2], [1, 0.95]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/jobs?q=${encodeURIComponent(search.trim())}`);
    } else {
      router.push("/jobs");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-[#00f0ff] selection:text-black font-body overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        {/* =========================================
            HERO SECTION: Cinematic & Immersive
            ========================================= */}
        <section className="relative h-screen min-h-[800px] flex flex-col justify-center items-center overflow-hidden">
          {/* Animated Liquid Background Blobs */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
             <motion.div 
               className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full mix-blend-screen opacity-40 blur-[100px]"
               style={{ background: "radial-gradient(circle, rgba(0,240,255,1) 0%, rgba(0,0,0,0) 70%)" }}
               animate={{ 
                 x: [0, 100, 0],
                 y: [0, 50, 0],
                 scale: [1, 1.2, 1]
               }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             />
             <motion.div 
               className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full mix-blend-screen opacity-30 blur-[120px]"
               style={{ background: "radial-gradient(circle, rgba(122,0,255,1) 0%, rgba(0,0,0,0) 70%)" }}
               animate={{ 
                 x: [0, -100, 0],
                 y: [0, -50, 0],
                 scale: [1, 1.3, 1]
               }}
               transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
             />
             <motion.div 
               className="absolute top-[20%] right-[30%] w-[40%] h-[40%] rounded-full mix-blend-screen opacity-20 blur-[80px]"
               style={{ background: "radial-gradient(circle, rgba(255,0,122,1) 0%, rgba(0,0,0,0) 70%)" }}
               animate={{ 
                 x: [0, 50, -50, 0],
                 y: [0, -50, 50, 0],
               }}
               transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
             />
          </div>

          {/* Grid Overlay for depth */}
          <div className="absolute inset-0 z-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 pointer-events-none" />

          <motion.div 
            style={{ y: yHeroText, opacity: opacityHero, scale: scaleHero }}
            className="relative z-10 container mx-auto px-6 text-center flex flex-col items-center mt-20"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-12 shadow-[0_0_30px_rgba(0,240,255,0.1)]"
            >
              <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse shadow-[0_0_10px_#00f0ff]" />
              <span className="text-xs md:text-sm font-bold tracking-[0.2em] uppercase text-[#00f0ff]">AI Vector Recruiting Engine</span>
            </motion.div>

            <h1 className="font-display text-[clamp(4rem,10vw,9.5rem)] font-black leading-[0.85] tracking-[-0.04em] mix-blend-plus-lighter mb-8 w-full max-w-[1200px]">
              <StaggeredText text="We don't find" className="justify-center" />
              <div className="relative inline-block mt-2 md:mt-4">
                <span className="absolute inset-0 bg-gradient-to-r from-[#00f0ff] via-[#fff] to-[#7a00ff] blur-2xl opacity-40 mix-blend-screen" />
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] via-[#fff] to-[#7a00ff]">
                  candidates.
                </span>
              </div>
            </h1>

            <motion.h1 
              className="font-display text-[clamp(4rem,10vw,9.5rem)] font-black leading-[0.85] tracking-[-0.04em] text-white/40 mix-blend-plus-lighter mb-12 w-full max-w-[1200px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              We <em className="not-italic text-white">compute</em> them.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 1.2 }}
              className="text-white/60 text-[clamp(1.1rem,2vw,1.4rem)] font-medium max-w-2xl leading-relaxed mb-16"
            >
              Legacy ATS relies on noisy keyword matching. We map human experience into a 1536-dimensional hyper-space for mathematically guaranteed hires.
            </motion.p>

            {/* Futuristic Search/CTA Bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.4, type: "spring" }}
              className="w-full max-w-2xl relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00f0ff] to-[#7a00ff] rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
              <form onSubmit={handleSearch} className="relative flex items-center bg-black/60 border border-white/10 backdrop-blur-2xl p-2 rounded-[2rem] shadow-2xl">
                <div className="pl-6 text-white/40">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Tell the engine what you need..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent border-none text-white px-6 py-5 focus:outline-none focus:ring-0 text-lg md:text-xl placeholder:text-white/30"
                />
                <MagneticButton strength={0.4}>
                  <button type="submit" className="bg-white text-black px-8 py-5 rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2">
                    Execute <span className="opacity-50">→</span>
                  </button>
                </MagneticButton>
              </form>
            </motion.div>
          </motion.div>
        </section>

        {/* =========================================
            BENTO GRID FEATURE SHOWCASE
            ========================================= */}
        <section className="py-40 relative z-20 bg-black">
          <div className="container mx-auto px-6 max-w-[1400px]">
            <div className="mb-20">
              <h2 className="font-display text-[clamp(3rem,5vw,5rem)] font-black leading-none tracking-tight">
                <StaggeredText text="Engineering" />
                <span className="text-[#00f0ff]">Superiority.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[800px]">
              {/* Feature 1: Large */}
              <TiltCard className="md:col-span-2 md:row-span-1 h-full" maxTilt={3}>
                <div className="card-interactive h-full w-full p-10 md:p-14 border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden relative group">
                  <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-[#00f0ff]/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-[#00f0ff]/20 transition-colors duration-700" />
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-8 text-[#00f0ff]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-display font-bold mb-4">O(1) Similarity Search</h3>
                      <p className="text-white/50 text-lg max-w-md font-medium leading-relaxed">By combining Asynchronous PostgreSQL with C-compiled Native Vector extensions (`pgvector`), we execute deep Cosine Similarity algorithms at the absolute hardware limit.</p>
                    </div>
                    
                    {/* Visual Code Block */}
                    <div className="mt-8 rounded-xl border border-white/10 bg-black/40 p-6 font-mono text-sm text-white/50 relative overflow-hidden group-hover:border-[#00f0ff]/30 transition-colors">
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/50 to-transparent" />
                      <span className="text-purple-400">SELECT</span> id, 1 - (embedding 
                      <span className="text-[#00f0ff] animate-pulse"> &lt;=&gt; </span> 
                      query_embedding) <span className="text-purple-400">AS</span> score <br/>
                      <span className="text-purple-400">FROM</span> candidates <br/>
                      <span className="text-purple-400">ORDER BY</span> embedding &lt;=&gt; query_embedding 
                      <span className="text-purple-400"> LIMIT</span> 1;
                    </div>
                  </div>
                </div>
              </TiltCard>

              {/* Feature 2: Tall */}
              <TiltCard className="md:col-span-1 md:row-span-2 h-full" maxTilt={5}>
                <div className="card-interactive h-full w-full p-10 border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#7a00ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-8 text-[#7a00ff]">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                    <h3 className="text-3xl font-display font-bold mb-4 leading-tight">Zero-Trust<br/>Bias Control</h3>
                    <p className="text-white/50 text-lg font-medium leading-relaxed mb-12">Our embedding models are mathematically stripped of gender, race, and age classifiers before matching occurs. Pure meritocracy.</p>
                  </div>

                  {/* Visual Abstract Art */}
                  <div className="absolute bottom-[-10%] right-[-10%] w-[120%] h-[50%] flex items-center justify-center">
                     <div className="w-[300px] h-[300px] rounded-full border border-white/10 shrink-0 relative flex items-center justify-center group-hover:scale-110 transition-transform duration-1000">
                       <div className="w-[200px] h-[200px] rounded-full border border-[#7a00ff]/30 shrink-0" />
                       <div className="w-[100px] h-[100px] rounded-full border border-[#00f0ff]/50 shrink-0 absolute" />
                       <div className="w-[10px] h-[10px] rounded-full bg-white absolute shadow-[0_0_20px_white]" />
                     </div>
                  </div>
                </div>
              </TiltCard>

              {/* Feature 3: Standard */}
              <TiltCard className="md:col-span-1 md:row-span-1 h-full" maxTilt={8}>
                <div className="card-interactive h-full w-full p-10 border border-white/5 bg-gradient-to-tr from-white/[0.03] to-transparent group">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-8 text-white">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-4">Magic-Byte Parsing</h3>
                  <p className="text-white/50 font-medium">Automatic PDF extraction pipeline that reads raw byte-streams to perfectly parse chaotic resumes.</p>
                </div>
              </TiltCard>

              {/* Feature 4: Standard */}
              <TiltCard className="md:col-span-1 md:row-span-1 h-full" maxTilt={8}>
                <div className="card-interactive h-full w-full p-10 border border-white/5 bg-gradient-to-tl from-white/[0.03] to-transparent group">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-8 text-[#00ff87]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-4">Automated Workflows</h3>
                  <p className="text-white/50 font-medium">Instantly generate tailored interview questions and match explanations per candidate.</p>
                </div>
              </TiltCard>
            </div>
          </div>
        </section>

        {/* =========================================
            INFINITE MARQUEE
            ========================================= */}
        <section className="py-20 bg-black overflow-hidden border-y border-white/[0.02]">
          <div className="flex w-[200vw] marquee-inner opacity-50 hover:opacity-100 transition-opacity duration-1000">
             {[...Array(4)].map((_, j) => (
                <div key={j} className="flex shrink-0 items-center justify-around w-[100vw]">
                  <span className="font-display text-[5vw] font-black uppercase tracking-tighter text-transparent stroke-text">NO KEYWORDS</span>
                  <span className="w-4 h-4 rounded-full bg-[#00f0ff]" />
                  <span className="font-display text-[5vw] font-black uppercase tracking-tighter text-white">PURE MATH</span>
                  <span className="w-4 h-4 rounded-full bg-[#7a00ff]" />
                </div>
             ))}
          </div>
        </section>

        {/* =========================================
            MASSIVE METRICS
            ========================================= */}
        <section className="py-40 relative z-10 bg-black">
          <div className="container mx-auto px-6 max-w-[1400px]">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
               {[
                 { stat: "15ms", label: "P99 Latency" },
                 { stat: "1536", label: "Dimensions" },
                 { stat: "98%", label: "Accuracy" }
               ].map((item, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, y: 50 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.8, delay: i * 0.2 }}
                   className="flex flex-col items-center text-center border-l border-white/10 pl-10"
                 >
                    <div className="font-display text-[clamp(4rem,8vw,7rem)] font-black text-white leading-none mb-4 -ml-4 tracking-tighter mix-blend-difference">
                      {item.stat}
                    </div>
                    <div className="text-[#00f0ff] uppercase tracking-[0.3em] font-bold text-sm">
                      {item.label}
                    </div>
                 </motion.div>
               ))}
             </div>
          </div>
        </section>

        {/* =========================================
            IMMERSIVE FOOTER / CTA
            ========================================= */}
        <section className="relative py-40 min-h-[800px] flex items-center justify-center overflow-hidden bg-black rounded-t-[4rem] border-t border-white/5">
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] to-transparent z-10 pointer-events-none" />
          
          {/* Animated Mesh Core */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-40 mix-blend-screen pointer-events-none">
            <motion.div className="w-full h-full rounded-full bg-gradient-to-tr from-[#00f0ff] to-[#7a00ff] blur-[150px]" animate={{ rotate: 360, scale: [1, 1.2, 0.8, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />
          </div>

          <div className="relative z-20 container mx-auto px-6 text-center">
            <motion.h2 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="font-display text-[clamp(4rem,10vw,8rem)] font-black text-white leading-[0.9] tracking-tighter mb-12"
            >
              Ready to <br />
              <span className="italic font-light">Evolve?</span>
            </motion.h2>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
               <MagneticButton strength={0.2}>
                  <Link href="/signup/employer" className="inline-flex items-center justify-center px-10 py-5 bg-white text-black rounded-full font-bold text-xl hover:bg-[#00f0ff] transition-colors duration-500 min-w-[200px]">
                    Deploy Engine
                  </Link>
               </MagneticButton>
               <MagneticButton strength={0.2}>
                  <Link href="/signup/candidate" className="inline-flex items-center justify-center px-10 py-5 bg-transparent border border-white/20 text-white rounded-full font-bold text-xl hover:bg-white/10 backdrop-blur-md transition-all duration-500 min-w-[200px]">
                    Get Evaluated
                  </Link>
               </MagneticButton>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Global CSS for stroke text */}
      <style dangerouslySetInnerHTML={{__html: `
        .stroke-text {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.3);
          color: transparent;
        }
      `}} />
    </div>
  );
}
