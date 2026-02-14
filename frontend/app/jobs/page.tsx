"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SaveJobButton } from "@/components/jobs/SaveJobButton";
import { ShareJobButton } from "@/components/jobs/ShareJobButton";
import { MatchMeter } from "@/components/jobs/MatchMeter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TiltCard } from "@/components/ui/TiltCard";

type Job = {
  id: string;
  source: string;
  title: string;
  company?: string | null;
  location?: string | null;
  description?: string;
  remote?: boolean | null;
  url?: string | null;
  match_score?: number;
  salary_min?: string | null;
  salary_max?: string | null;
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function BrowseJobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [remote, setRemote] = useState(searchParams.get("remote") === "true");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("include_external", "true");
    if (q.trim()) params.set("q", q.trim());
    if (location.trim()) params.set("location", location.trim());
    if (remote) params.set("remote", "true");
    try {
      const data = await apiGet<Job[]>(
        `/matching/browse?${params.toString()}`,
        session?.access_token ?? undefined
      );
      setJobs(data);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [q, location, remote, session?.access_token]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    setQ(searchParams.get("q") || "");
    setLocation(searchParams.get("location") || "");
    setRemote(searchParams.get("remote") === "true");
  }, [searchParams]);

  const handleSearch = () => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (location.trim()) p.set("location", location.trim());
    if (remote) p.set("remote", "true");
    router.push(`/jobs?${p.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] relative">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_75%_45%_at_50%_0%,var(--accent-dim),transparent_50%)] pointer-events-none" aria-hidden />
      <Navbar />
      <main className="relative max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 pt-24 pb-20">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <h1 className="font-display text-display text-[clamp(1.75rem,4vw,2.5rem)] text-white mb-2 tracking-tight">
            Browse jobs
          </h1>
          <p className="text-[var(--text-muted)] text-[15px] max-w-xl">
            Platform and aggregated listings. Sign in for AI match scores.
          </p>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="card-sharp input-glow p-5 sm:p-6 mb-12 border-[var(--border)] bg-[var(--bg-card)] transition-shadow duration-300"
        >
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-3">
            <div className="sm:col-span-5">
              <Input
                placeholder="Title or keywords"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="bg-[var(--bg)]/80 border-[var(--border)] placeholder:text-[var(--text-dim)] focus:border-[var(--accent)] focus:ring-[var(--accent)]/20"
              />
            </div>
            <div className="sm:col-span-4">
              <Input
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="bg-[var(--bg)]/80 border-[var(--border)] placeholder:text-[var(--text-dim)] focus:border-[var(--accent)] focus:ring-[var(--accent)]/20"
              />
            </div>
            <div className="sm:col-span-3 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={remote}
                  onChange={(e) => setRemote(e.target.checked)}
                  className="rounded-sm border-[var(--border-strong)] bg-[var(--bg-card)] text-[var(--accent)] focus:ring-[var(--accent)]/30"
                />
                <span className="text-[13px] text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors font-medium">Remote only</span>
              </label>
              <Button onClick={handleSearch} className="btn-primary btn-magnetic shrink-0">
                Search
              </Button>
            </div>
          </div>
        </motion.section>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="card-sharp skeleton h-24"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </motion.div>
        ) : jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="card-sharp p-12 text-center max-w-md mx-auto border-[var(--border)] bg-[var(--bg-card)]"
          >
            <div className="w-14 h-14 mx-auto mb-5 rounded-[var(--radius-md)] bg-[var(--border)] flex items-center justify-center">
              <svg className="w-7 h-7 text-[var(--text-dim)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <p className="font-display text-display-sm text-white text-lg tracking-tight">No jobs match your filters</p>
            <p className="text-[var(--text-muted)] text-[14px] mt-2">Try different keywords or location.</p>
            <Button
              variant="ghost"
              onClick={() => { router.push("/jobs"); setQ(""); setLocation(""); setRemote(false); }}
              className="mt-6 btn-ghost"
            >
              Clear filters
            </Button>
          </motion.div>
        ) : (
          <motion.ul
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {jobs.map((job) => (
                <motion.li key={`${job.source}-${job.id}`} variants={item}>
                  <TiltCard maxTilt={4} glare={false} className="group">
                  <div className="card-interactive shine-hover p-5 sm:p-6 group card-sharp">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          {job.source === "demo" && (
                            <span className="px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-[var(--radius-sm)] bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--accent)]/20">
                              Demo
                            </span>
                          )}
                          {job.source === "platform" && (
                            <span className="px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-[var(--radius-sm)] bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--accent)]/20">
                              Platform
                            </span>
                          )}
                          {job.match_score != null && (
                            <MatchMeter score={job.match_score} />
                          )}
                        </div>
                        {job.source === "platform" ? (
                          <Link href={`/jobs/${job.id}`} className="block">
                            <h3 className="font-display text-display-sm text-white text-[17px] group-hover:text-[var(--accent)] transition-colors tracking-tight">
                              {job.title}
                            </h3>
                          </Link>
                        ) : (
                          <h3 className="font-display text-display-sm text-white text-[17px] tracking-tight">
                            {job.title}
                          </h3>
                        )}
                        {job.company && (
                          <p className="text-sm text-[var(--text-muted)] mt-0.5">{job.company}</p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--text-dim)]">
                          {job.location && <span>{job.location}</span>}
                          {job.remote && <span className="text-[var(--accent)]">Remote</span>}
                          {(job.salary_min || job.salary_max) && (
                            <span className="text-[var(--text-muted)]">
                              {job.salary_min && job.salary_max
                                ? `$${Number(job.salary_min).toLocaleString()} – $${Number(job.salary_max).toLocaleString()}`
                                : job.salary_min
                                  ? `From $${Number(job.salary_min).toLocaleString()}`
                                  : ""}
                            </span>
                          )}
                        </div>
                        {job.description && (
                          <p className="mt-2 text-sm text-[var(--text-muted)] line-clamp-2">{job.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 sm:pl-4">
                        {job.source === "platform" && <SaveJobButton jobId={job.id} />}
                        <ShareJobButton jobId={job.id} jobTitle={job.title} url={job.url ?? undefined} />
                        {job.source === "platform" && (
                          <Link href={`/jobs/${job.id}`} className="btn-primary btn-magnetic text-[13px] py-2 px-4">
                            View & apply
                          </Link>
                        )}
                        {job.source === "demo" && (
                          <span className="text-sm py-2 px-4 text-[var(--text-dim)]">
                            Demo listing
                          </span>
                        )}
                        {job.source !== "platform" && job.source !== "demo" && job.url && (
                          <a href={job.url} target="_blank" rel="noopener noreferrer" className="btn-primary btn-magnetic text-[13px] py-2 px-4">
                            View source →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  </TiltCard>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function BrowseJobsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      }
    >
      <BrowseJobsContent />
    </Suspense>
  );
}
