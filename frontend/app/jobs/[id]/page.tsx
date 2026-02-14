"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost } from "@/lib/api";
import { SaveJobButton } from "@/components/jobs/SaveJobButton";
import { ShareJobButton } from "@/components/jobs/ShareJobButton";
import { useToast } from "@/components/ui/Toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type Job = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  remote: boolean | null;
  requirements: Record<string, unknown> | null;
};

type SimilarJob = {
  id: string;
  title: string;
  location: string | null;
  remote: boolean | null;
};

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
      setApplyError("Please log in as a candidate to apply");
      return;
    }
    setApplying(true);
    setApplyError("");
    try {
      await apiPost(`/applications?job_id=${job.id}`, {}, session.access_token);
      setApplied(true);
      toast.success("Application submitted");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to apply";
      setApplyError(msg);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <Navbar />
        <main className="max-w-2xl mx-auto px-6 sm:px-8 pt-28 pb-20">
          <div className="skeleton h-8 w-3/4 mb-4 rounded-[var(--radius-md)]" />
          <div className="skeleton h-4 w-1/2 mb-8 rounded-[var(--radius-sm)]" />
          <div className="skeleton h-48 w-full rounded-[var(--radius-md)]" />
        </main>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-28">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[var(--text-muted)]">
            Job not found.
          </motion.p>
          <Link href="/jobs" className="mt-4 text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium link-underline">
            Browse jobs
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const canApply = user && role === "candidate";
  const backHref = user && role === "candidate" ? "/dashboard/candidate" : "/jobs";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 sm:px-8 pt-28 pb-20">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Link href={backHref} className="text-[13px] text-[var(--accent)] hover:text-[var(--accent-hover)] font-semibold link-underline inline-block mb-8">
            ← {user && role === "candidate" ? "Back to dashboard" : "Back to browse"}
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="card-sharp p-6 sm:p-8 border-[var(--border)] bg-[var(--bg-card)]"
        >
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-display text-display-sm text-[clamp(1.5rem,4vw,2rem)] text-white flex-1 tracking-tight">{job.title}</h1>
            <div className="flex gap-1 shrink-0">
              {role === "candidate" && <SaveJobButton jobId={job.id} />}
              <ShareJobButton jobId={job.id} jobTitle={job.title} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-[var(--text-muted)] text-sm">
            {job.location && (
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                {job.location}
              </span>
            )}
            {job.remote && (
              <span className="inline-flex items-center gap-1.5 text-[var(--accent)] font-medium">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h2a2 2 0 002-2v-3a2 2 0 012-2h2.945M8 3v.5" /></svg>
                Remote
              </span>
            )}
          </div>
          {job.description && (
            <div className="mt-6">
              <h2 className="font-display text-display-sm text-white mb-2">Description</h2>
              <p className="text-[var(--text-muted)] whitespace-pre-wrap leading-relaxed">{job.description}</p>
            </div>
          )}
          {job.requirements && Object.keys(job.requirements).length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-display-sm text-white mb-2">Requirements</h2>
              <pre className="text-[14px] text-[var(--text-muted)] bg-black/40 p-4 rounded-[var(--radius-md)] overflow-auto border border-[var(--border)]">
                {JSON.stringify(job.requirements, null, 2)}
              </pre>
            </div>
          )}
          {applyError && (
            <div className="mt-4 p-3 bg-red-500/15 text-red-400 rounded-[var(--radius-md)] text-[13px] border border-red-500/20">{applyError}</div>
          )}
          <div className="mt-8 flex flex-wrap gap-4">
            {canApply ? (
              applied ? (
                <span className="px-6 py-3 bg-[var(--accent-dim)] text-[var(--accent)] font-semibold rounded-[var(--radius-button)] border border-[var(--accent)]/20">
                  Application submitted
                </span>
              ) : (
                <button type="button" onClick={handleApply} disabled={applying} className="btn-primary btn-magnetic px-6 py-3 disabled:opacity-50">
                  {applying ? "Applying..." : "Apply now"}
                </button>
              )
            ) : (
              <Link href="/login" className="btn-primary px-6 py-3 inline-block">
                Log in to apply
              </Link>
            )}
            <Link href={backHref} className="btn-ghost px-6 py-3 inline-block">
              {user && role === "candidate" ? "Back to dashboard" : "Browse more jobs"}
            </Link>
          </div>
        </motion.div>

        {similarJobs.length > 0 && (
          <ScrollReveal amount={0.2} className="mt-12">
            <h2 className="font-display text-display-sm text-xl text-white mb-4">Similar jobs</h2>
            <ul className="space-y-3">
              {similarJobs.map((s, i) => (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/jobs/${s.id}`} className="card-sharp card-interactive block p-4 hover:border-[var(--border-strong)] transition-colors border-[var(--border)] bg-[var(--bg-card)]">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-display text-display-sm text-white">{s.title}</p>
                        <div className="flex gap-2 text-sm text-[var(--text-muted)] mt-0.5">
                          {s.location && <span>{s.location}</span>}
                          {s.remote && <span className="text-[var(--accent)]">Remote</span>}
                        </div>
                      </div>
                      <span className="text-[var(--accent)] text-sm font-medium">View →</span>
                    </div>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </ScrollReveal>
        )}
      </main>
      <Footer />
    </div>
  );
}
