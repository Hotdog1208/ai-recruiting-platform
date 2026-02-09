"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SaveJobButton } from "@/components/jobs/SaveJobButton";
import { ShareJobButton } from "@/components/jobs/ShareJobButton";

type Job = {
  id: string;
  source: string;
  title: string;
  company?: string | null;
  location?: string | null;
  description?: string;
  remote?: boolean | null;
  url?: string;
  match_score?: number;
};

function BrowseJobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
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
    if (user?.id) params.set("user_id", user.id);
    try {
      const data = await apiGet<Job[]>(`/matching/browse?${params.toString()}`);
      setJobs(data);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [q, location, remote, user?.id]);

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
    <div className="min-h-screen bg-[#0a0a0a]">
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-white">
            Recruiter<span className="text-teal-400">.Solutions</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-zinc-400 hover:text-white text-sm font-medium">Log in</Link>
            <Link href="/signup" className="bg-teal-500 text-black px-4 py-2 rounded-lg font-semibold text-sm">Sign up</Link>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Browse Jobs</h1>
        <p className="text-zinc-400 mb-8">Platform + aggregated external listings. Sign up for AI matching.</p>

        <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Job title or keywords"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remote}
                  onChange={(e) => setRemote(e.target.checked)}
                  className="rounded border-white/20 bg-zinc-900 text-teal-500 focus:ring-teal-500"
                />
                <span className="text-sm text-zinc-400">Remote only</span>
              </label>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-zinc-500">No jobs found. Try adjusting your search.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={`${job.source}-${job.id}`} hover className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-white">{job.title}</h3>
                      <div className="flex items-center gap-1 shrink-0">
                        {job.source === "platform" && <SaveJobButton jobId={job.id} />}
                        <ShareJobButton jobId={job.id} jobTitle={job.title} url={job.url} />
                      </div>
                    </div>
                    {job.company && <p className="text-sm text-zinc-400 mt-0.5">{job.company}</p>}
                    <div className="mt-2 flex gap-3 text-sm text-zinc-500">
                      {job.location && <span>{job.location}</span>}
                      {job.remote && <span className="text-teal-400">Remote</span>}
                      {job.match_score != null && (
                        <span className="text-teal-400 font-medium">{Math.round(job.match_score)}% match</span>
                      )}
                    </div>
                  </div>
                  {job.source === "platform" ? (
                    <Link href={`/jobs/${job.id}`} className="px-4 py-2 bg-teal-500 text-black rounded-lg font-medium text-sm hover:bg-teal-400 shrink-0">
                      View
                    </Link>
                  ) : (
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-teal-500 text-black rounded-lg font-medium text-sm hover:bg-teal-400 shrink-0">
                      View source →
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function BrowseJobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    }>
      <BrowseJobsContent />
    </Suspense>
  );
}
