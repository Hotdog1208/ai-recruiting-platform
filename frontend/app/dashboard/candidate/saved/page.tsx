"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiDelete } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type SavedJob = {
  id: string;
  title: string;
  description?: string;
  location: string | null;
  remote: boolean | null;
  saved_at: string | null;
};

export default function SavedJobsPage() {
  const { user, session } = useAuth();
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  const loadJobs = useCallback(async () => {
    if (!user || !session?.access_token) return;
    setLoading(true);
    try {
      const data = await apiGet<SavedJob[]>(`/saved-jobs`, session.access_token);
      setJobs(data);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [user, session?.access_token]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleUnsave = async (jobId: string) => {
    if (!session?.access_token) return;
    await apiDelete(`/saved-jobs?job_id=${jobId}`, session.access_token);
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold text-white mb-2">Saved Jobs</h1>
      <p className="text-zinc-400 mb-8">
        Jobs you&apos;ve saved to apply later. One click to apply.
      </p>

      {jobs.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-zinc-400 font-medium">No saved jobs yet</p>
          <p className="text-zinc-500 text-sm mt-1">Save jobs from the job cards to review them later</p>
          <Link href="/dashboard/candidate" className="mt-6 inline-block text-teal-400 hover:text-teal-300 font-medium">
            Browse jobs →
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} hover className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-white">{job.title}</h3>
                {job.description && (
                  <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{job.description}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-2 text-sm text-zinc-500">
                  {job.location && <span>{job.location}</span>}
                  {job.remote && <span className="text-teal-400">Remote</span>}
                  {job.saved_at && (
                    <span>Saved {new Date(job.saved_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/jobs/${job.id}`}>
                  <Button>Apply now</Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => handleUnsave(job.id)}
                  className="text-zinc-400 hover:text-red-400"
                >
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
