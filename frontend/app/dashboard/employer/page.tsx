"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Job = {
  id: string;
  title: string;
  description?: string | null;
  location: string | null;
  remote: boolean | null;
};

type EmployerProfile = {
  id: string;
  company_name: string;
  industry: string | null;
};

export default function EmployerDashboardPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newJob, setNewJob] = useState({ title: "", description: "", location: "", remote: false });
  const [submitting, setSubmitting] = useState(false);
  const [jobError, setJobError] = useState("");
  const [applicantCounts, setApplicantCounts] = useState<Record<string, number>>({});
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const profileRes = await apiGet<EmployerProfile>(`/employers/by-user/${user.id}`);
        setProfile(profileRes);
        const jobsRes = await apiGet<Job[]>(`/jobs?employer_id=${profileRes.id}`);
        setJobs(jobsRes);
        const counts: Record<string, number> = {};
        for (const job of jobsRes) {
          try {
            const apps = await apiGet<{ id: string }[]>(`/applications/by-job/${job.id}`);
            counts[job.id] = apps.length;
          } catch {
            counts[job.id] = 0;
          }
        }
        setApplicantCounts(counts);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const loadJobs = async () => {
    if (!profile) return;
    const jobsRes = await apiGet<Job[]>(`/jobs?employer_id=${profile.id}`);
    setJobs(jobsRes);
    const counts: Record<string, number> = {};
    for (const job of jobsRes) {
      try {
        const apps = await apiGet<{ id: string }[]>(`/applications/by-job/${job.id}`);
        counts[job.id] = apps.length;
      } catch {
        counts[job.id] = 0;
      }
    }
    setApplicantCounts(counts);
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmitting(true);
    setJobError("");
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${baseUrl}/jobs?employer_id=${profile.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newJob.title.trim(),
          description: newJob.description.trim() || undefined,
          location: newJob.location.trim() || undefined,
          remote: newJob.remote,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = Array.isArray(err.detail) ? err.detail.join("; ") : err.detail || "Failed to create job";
        setJobError(msg);
        return;
      }
      setNewJob({ title: "", description: "", location: "", remote: false });
      setShowForm(false);
      loadJobs();
    } catch (err) {
      setJobError(err instanceof Error ? err.message : "Failed to create job");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Delete this job? Applications will be removed too.")) return;
    setDeletingId(jobId);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    try {
      const res = await fetch(`${baseUrl}/jobs/${jobId}`, { method: "DELETE" });
      if (res.ok) loadJobs();
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicateJob = async (job: Job) => {
    if (!profile) return;
    setDuplicatingId(job.id);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    try {
      const res = await fetch(`${baseUrl}/jobs?employer_id=${profile.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${job.title} (Copy)`,
          description: job.description || undefined,
          location: job.location || undefined,
          remote: job.remote ?? false,
        }),
      });
      if (res.ok) loadJobs();
    } finally {
      setDuplicatingId(null);
    }
  };

  const totalApplicants = Object.values(applicantCounts).reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-white/5 rounded w-64" />
          <div className="h-12 bg-white/5 rounded w-32" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          {profile?.company_name ? `${profile.company_name} Dashboard` : "Employer Dashboard"}
        </h1>
        <p className="text-zinc-400 mt-1">
          Post jobs and manage your openings.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Card className="p-5">
          <p className="text-sm text-zinc-500">Active jobs</p>
          <p className="text-2xl font-bold text-white mt-1">{jobs.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-zinc-500">Total applicants</p>
          <p className="text-2xl font-bold text-white mt-1">{totalApplicants}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-zinc-500">Avg per job</p>
          <p className="text-2xl font-bold text-white mt-1">
            {jobs.length ? Math.round(totalApplicants / jobs.length) : 0}
          </p>
        </Card>
        <Card className="p-5">
          <Link href="/dashboard/employer/market" className="block">
            <p className="text-sm text-zinc-500">Market intel</p>
            <p className="text-teal-400 font-medium mt-1 hover:text-teal-300">View →</p>
          </Link>
        </Card>
      </div>

      <div className="mb-8">
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? "outline" : "primary"}
        >
          {showForm ? "Cancel" : "Post a Job"}
        </Button>

        {showForm && (
          <Card className="mt-4 p-6">
            <h3 className="font-semibold text-white mb-4">Create new job</h3>
            <form onSubmit={handleCreateJob} className="space-y-5">
              {jobError && (
                <div className="p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">{jobError}</div>
              )}
              <Input
                label="Job title"
                placeholder="Software Engineer"
                value={newJob.title}
                onChange={(e) => setNewJob((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Description (optional)</label>
                <textarea
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-900/50 border border-white/10 text-white placeholder:text-zinc-500 min-h-[100px]"
                  placeholder="Brief description of the role..."
                  value={newJob.description}
                  onChange={(e) => setNewJob((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <Input
                label="Location"
                placeholder="New York, NY or Remote"
                value={newJob.location}
                onChange={(e) => setNewJob((prev) => ({ ...prev, location: e.target.value }))}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remote"
                  checked={newJob.remote}
                  onChange={(e) => setNewJob((prev) => ({ ...prev, remote: e.target.checked }))}
                  className="rounded border-white/20 bg-zinc-900 text-teal-500 focus:ring-teal-500"
                />
                <label htmlFor="remote" className="text-sm text-zinc-400">Remote position</label>
              </div>
              <Button type="submit" isLoading={submitting} disabled={submitting}>
                Post Job
              </Button>
            </form>
          </Card>
        )}
      </div>

      <h2 className="text-lg font-semibold text-white mb-4">Your Jobs</h2>
      {jobs.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-zinc-400 font-medium">No jobs posted yet</p>
          <p className="text-zinc-500 text-sm mt-1">Click &quot;Post a Job&quot; to get started</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white">{job.title}</h3>
                <div className="mt-1 flex flex-wrap gap-2 text-sm text-zinc-500">
                  {job.location && <span>{job.location}</span>}
                  {job.remote && <span className="text-teal-400 font-medium">Remote</span>}
                  <span className="text-zinc-600">• {applicantCounts[job.id] ?? 0} applicants</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/jobs/${job.id}/applicants`}
                  className="px-4 py-2 text-sm font-medium text-teal-400 border border-teal-500/30 rounded-lg hover:bg-teal-500/10 transition-colors inline-block"
                >
                  View applicants
                </Link>
                <Link
                  href={`/jobs/${job.id}`}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 border border-white/10 rounded-lg hover:bg-white/5 transition-colors inline-block"
                >
                  View job
                </Link>
                <button
                  onClick={() => handleDuplicateJob(job)}
                  disabled={duplicatingId === job.id}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 border border-white/10 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  {duplicatingId === job.id ? "Duplicating..." : "Duplicate"}
                </button>
                <button
                  onClick={() => handleDeleteJob(job.id)}
                  disabled={deletingId === job.id}
                  className="px-4 py-2 text-sm font-medium text-red-400/80 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                  {deletingId === job.id ? "Deleting..." : "Remove"}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
