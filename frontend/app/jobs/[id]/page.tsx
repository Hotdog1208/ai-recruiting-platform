"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost } from "@/lib/api";
import { SaveJobButton } from "@/components/jobs/SaveJobButton";
import { ShareJobButton } from "@/components/jobs/ShareJobButton";
import { useToast } from "@/components/ui/Toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { MagneticButton } from "@/components/ui/MagneticButton";

type Job = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  remote: boolean | null;
  requirements: Record<string, unknown> | null;
  company?: string;
};

type SimilarJob = {
  id: string;
  title: string;
  location: string | null;
  remote: boolean | null;
};

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 } };
const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } };

export default function JobDetailPage() {
  const params = useParams();
  const { user, role, session } = useAuth();
  const toast = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [similarJobs, setSimilarJobs] = useState<SimilarJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyError, setApplyError] = useState("");

  const { scrollYProgress } = useScroll();
  const headerY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    if (!params.id) return;
    apiGet<Job>(`/jobs/${params.id}`)
      .then(setJob)
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (!params.id || !job) return;
    apiGet<SimilarJob[]>(`/jobs/${params.id}/similar`)
      .then(setSimilarJobs)
      .catch(() => setSimilarJobs([]));
  }, [params.id, job]);

  const handleApply = async () => {
    if (!user || !job || role !== "candidate" || !session?.access_token) {
      toast.error("Authentication required to deploy application vector.");
      return;
    }
    setApplying(true);
    setApplyError("");
    try {
      await apiPost(`/applications?job_id=${job.id}`, {}, session.access_token);
      setApplied(true);
      toast.success("Application vector successfully transmitted.");
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <Navbar />
        <main className="flex items-center justify-center min-h-[80vh]">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-t-2 border-[var(--accent-primary)] animate-spin" />
            <div className="absolute inset-2 rounded-full border-r-2 border-[var(--accent-secondary)] animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
          </div>
        </main>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-6">
          <h1 className="font-display text-4xl font-black text-white mb-4">Signal Lost</h1>
          <p className="text-gray-400 mb-8">The requested job vector could not be found in the database.</p>
          <Link href="/jobs" className="btn-primary">Return to Grid</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const canApply = user && role === "candidate";

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white font-body selection:bg-[var(--accent-primary)]/30">
      <Navbar />

      {/* 1. Immersive Company Header */}
      <section className="relative w-full h-[50vh] min-h-[400px] flex items-end justify-center overflow-hidden border-b border-white/5">
         {/* Parallax Background */}
         <motion.div style={{ y: headerY, opacity: headerOpacity }} className="absolute inset-0 w-full h-[120%] -top-[10%] bg-black pointer-events-none">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 blur-[120px] rounded-full pointer-events-none" />
         </motion.div>

         <div className="relative z-10 w-full max-w-[1000px] mx-auto px-6 lg:px-12 pb-16 flex justify-between items-end gap-8">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="flex-1">
               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest text-[var(--accent-primary)] uppercase mb-6">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                  Active Vector
               </div>
               <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-black leading-none tracking-tighter mb-4 drop-shadow-2xl">
                  {job.title}
               </h1>
               <div className="flex flex-wrap items-center gap-4 text-gray-400 font-medium text-lg">
                  <span className="text-white font-bold">{job.company || "Unknown Enterprise"}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <span>{job.location || "Remote Origin"}</span>
                  {job.remote && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      <span className="text-[var(--accent-secondary)] flex items-center gap-1.5">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h2a2 2 0 002-2v-3a2 2 0 012-2h2.945M8 3v.5" /></svg>
                         Remote Endorsed
                      </span>
                    </>
                  )}
               </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="hidden md:flex flex-col gap-3">
               {/* Quick stats floating cards */}
               <div className="card-interactive p-4 border-white/10 bg-black/60 shadow-2xl backdrop-blur-xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center font-black">98%</div>
                  <div>
                     <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Alignment Score</p>
                     <p className="text-white font-bold">Excellent Match</p>
                  </div>
               </div>
            </motion.div>
         </div>
      </section>

      {/* 2. Floating Action Bar (Sticky) */}
      <div className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-2xl shadow-2xl">
         <div className="max-w-[1000px] mx-auto px-6 lg:px-12 py-4 flex items-center justify-between gap-4">
            <div className="hidden sm:flex items-center gap-4 flex-1 truncate">
               <h3 className="font-display font-bold text-white truncate">{job.title}</h3>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
               <ShareJobButton jobId={job.id} jobTitle={job.title} />
               {role === "candidate" && <SaveJobButton jobId={job.id} />}
               {!canApply ? (
                 <Link href="/login" className="btn-ghost py-2">Log in to Apply</Link>
               ) : applied ? (
                 <span className="btn-primary opacity-50 cursor-not-allowed py-2 shadow-none border-green-500 text-green-400 bg-green-500/10">Vector Transmitted</span>
               ) : (
                 <MagneticButton strength={0.2}>
                    <button onClick={handleApply} disabled={applying} className="btn-primary py-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] min-w-[160px]">
                       {applying ? "Parsing..." : "Apply Now"}
                    </button>
                 </MagneticButton>
               )}
            </div>
         </div>
         {applyError && <div className="absolute top-full left-0 w-full bg-red-500/90 text-white text-center py-2 text-xs font-bold tracking-widest uppercase">{applyError}</div>}
      </div>

      {/* 3. Main Content Payload */}
      <main className="max-w-[1000px] mx-auto px-6 lg:px-12 py-20 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-16">
         
         {/* Description Container */}
         <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-16">
            
            {job.description && (
               <motion.div variants={fadeUp}>
                  <h2 className="font-display text-2xl font-bold text-white tracking-tight mb-6 flex items-center gap-3">
                     <span className="w-8 h-px bg-[var(--accent-primary)]" /> Core Responsibilities
                  </h2>
                  <div className="prose prose-invert prose-lg max-w-none text-gray-400 marker:text-[var(--accent-primary)]">
                     <p className="whitespace-pre-wrap leading-relaxed">{job.description}</p>
                  </div>
               </motion.div>
            )}

            {job.requirements && Object.keys(job.requirements).length > 0 && (
               <motion.div variants={fadeUp}>
                  <h2 className="font-display text-2xl font-bold text-white tracking-tight mb-6 flex items-center gap-3">
                     <span className="w-8 h-px bg-[var(--accent-secondary)]" /> Required Protocols
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                     {Object.entries(job.requirements).map(([key, value], idx) => (
                        <div key={idx} className="card-interactive p-4 border-white/5 bg-black/40 backdrop-blur-md">
                           <p className="text-[10px] font-black uppercase text-[var(--accent-secondary)] tracking-widest mb-1">{key.replace(/_/g, ' ')}</p>
                           <p className="text-white font-medium">{String(value)}</p>
                        </div>
                     ))}
                  </div>
               </motion.div>
            )}

         </motion.div>

         {/* Sidebar Metadeta */}
         <div className="space-y-8">
            <TiltCard maxTilt={2}>
               <div className="card-premium p-6 border-white/10 bg-gradient-to-br from-[var(--bg-elevated)] to-black/80 shadow-2xl">
                  <h3 className="text-xs font-bold tracking-widest uppercase text-gray-500 pb-4 border-b border-white/10 mb-4">Enterprise Data</h3>
                  <div className="space-y-4">
                     <div>
                        <p className="text-gray-400 text-sm">Entity</p>
                        <p className="font-bold text-white">{job.company || "Classified"}</p>
                     </div>
                     <div>
                        <p className="text-gray-400 text-sm">Location Matrix</p>
                        <p className="font-bold text-white">{job.location || "N/A"}</p>
                     </div>
                     <div>
                        <p className="text-gray-400 text-sm">Deployment</p>
                        <p className="font-bold text-white line-clamp-2 md:line-clamp-none">{job.remote ? "Remote Distributed" : "On-Site Centralized"}</p>
                     </div>
                  </div>
               </div>
            </TiltCard>

            {similarJobs.length > 0 && (
               <ScrollReveal amount={0.1}>
                  <h3 className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-4">Adjacent Vectors ({similarJobs.length})</h3>
                  <div className="space-y-3">
                     {similarJobs.map(s => (
                        <Link key={s.id} href={`/jobs/${s.id}`} className="block card-interactive p-4 border-white/5 bg-black/40 hover:bg-white/5 transition-colors group">
                           <h4 className="font-bold text-white text-sm mb-1 group-hover:text-[var(--accent-primary)] transition-colors">{s.title}</h4>
                           <div className="flex items-center gap-2 text-xs text-gray-500">
                             {s.location && <span>{s.location}</span>}
                             {s.remote && <span className="text-[var(--accent-primary)] font-bold">REMOTE</span>}
                           </div>
                        </Link>
                     ))}
                  </div>
               </ScrollReveal>
            )}
         </div>

      </main>

      <Footer />
    </div>
  );
}
