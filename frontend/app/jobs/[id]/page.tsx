"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SaveJobButton } from "@/components/jobs/SaveJobButton";
import { ShareJobButton } from "@/components/jobs/ShareJobButton";

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
  const { user, role } = useAuth();
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
  }, [params.id, job?.id]);

  const handleApply = async () => {
    if (!user || !job || role !== "candidate") {
      setApplyError("Please log in as a candidate to apply");
      return;
    }
    setApplying(true);
    setApplyError("");
    try {
      const profile = await apiGet<{ id: string }>(`/candidates/by-user/${user.id}`);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(
        `${baseUrl}/applications?job_id=${job.id}&candidate_id=${profile.id}`,
        { method: "POST" }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to apply");
      }
      setApplied(true);
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/5 rounded w-3/4" />
            <div className="h-4 bg-white/5 rounded w-1/2" />
            <div className="h-32 bg-white/5 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
        <p className="text-zinc-500">Job not found.</p>
        <Link href="/jobs" className="mt-4 text-teal-400 hover:text-teal-300 font-medium">
          Browse jobs
        </Link>
      </div>
    );
  }

  const canApply = user && role === "candidate";
  const backHref = user && role === "candidate" ? "/dashboard/candidate" : "/jobs";

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <nav className="bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href={backHref} className="text-sm text-teal-400 hover:text-teal-300 font-medium">
            ← {user && role === "candidate" ? "Back to jobs" : "Back to browse"}
          </Link>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="p-8">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-white flex-1">{job.title}</h1>
            <div className="flex gap-1 shrink-0">
              {role === "candidate" && <SaveJobButton jobId={job.id} />}
              <ShareJobButton jobId={job.id} jobTitle={job.title} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-zinc-400">
            {job.location && (
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {job.location}
              </span>
            )}
            {job.remote && (
              <span className="inline-flex items-center gap-1.5 text-teal-400 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h2a2 2 0 002-2v-3a2 2 0 012-2h2.945M8 3v.5" />
                </svg>
                Remote
              </span>
            )}
          </div>
          {job.description && (
            <div className="mt-6">
              <h2 className="font-semibold text-white mb-2">Description</h2>
              <p className="text-zinc-400 whitespace-pre-wrap">{job.description}</p>
            </div>
          )}
          {job.requirements && Object.keys(job.requirements).length > 0 && (
            <div className="mt-8">
              <h2 className="font-semibold text-white mb-2">Requirements</h2>
              <pre className="text-sm text-zinc-400 bg-zinc-900/50 p-4 rounded-lg overflow-auto border border-white/5">
                {JSON.stringify(job.requirements, null, 2)}
              </pre>
            </div>
          )}
          {applyError && (
            <div className="mt-4 p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">{applyError}</div>
          )}
          <div className="mt-8 flex flex-wrap gap-4">
            {canApply ? (
              applied ? (
                <span className="px-6 py-3 bg-teal-500/20 text-teal-400 font-medium rounded-lg">
                  Application submitted
                </span>
              ) : (
                <Button onClick={handleApply} disabled={applying}>
                  {applying ? "Applying..." : "Apply now"}
                </Button>
              )
            ) : (
              <Link href="/login" className="inline-block">
                <Button>Log in to apply</Button>
              </Link>
            )}
            <Link
              href={backHref}
              className="px-6 py-3 border border-white/10 text-zinc-400 font-medium rounded-lg hover:bg-white/5 transition-colors inline-block"
            >
              {user && role === "candidate" ? "Back to dashboard" : "Browse more jobs"}
            </Link>
          </div>
        </Card>

        {similarJobs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-semibold text-white mb-4">Similar jobs</h2>
            <div className="space-y-3">
              {similarJobs.map((s) => (
                <Link key={s.id} href={`/jobs/${s.id}`}>
                  <Card hover className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-white">{s.title}</p>
                      <div className="flex gap-2 text-sm text-zinc-500 mt-0.5">
                        {s.location && <span>{s.location}</span>}
                        {s.remote && <span className="text-teal-400">Remote</span>}
                      </div>
                    </div>
                    <span className="text-teal-400 text-sm font-medium">View →</span>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
