"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api";
import { Card } from "@/components/ui/Card";
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
  match_reason?: string;
  suggested_for_you?: boolean;
};

type CandidateProfile = {
  id: string;
  full_name: string;
  location: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  age?: number | null;
  work_preference?: string | null;
  work_type?: string | null;
  headline?: string | null;
  skills: string[] | null;
  resume_parsed_data?: unknown;
};

export default function CandidateDashboardPage() {
  const { user, session } = useAuth();
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [browseJobs, setBrowseJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRecommended, setShowRecommended] = useState(true);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {
    async function load() {
      if (!user || !session?.access_token) return;
      try {
        const [profileRes, ...rest] = await Promise.all([
          apiGet<CandidateProfile>(`/candidates/by-user/${user.id}`, session.access_token).catch(() => null),
          apiGet<Job[]>(`/matching/recommended`, session.access_token).catch(() => []),
          apiGet<Job[]>(`/matching/browse?include_external=true`, session.access_token).catch(() => []),
        ]);
        setProfile(profileRes);
        setRecommendedJobs(Array.isArray(rest[0]) ? rest[0] : []);
        setBrowseJobs(Array.isArray(rest[1]) ? rest[1] : []);
      } catch {
        setRecommendedJobs([]);
        setBrowseJobs([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, session?.access_token]);

  const filterJobs = (jobs: Job[]) => {
    return jobs.filter((j) => {
      if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !(j.company || "").toLowerCase().includes(search.toLowerCase())) return false;
      if (locationFilter && !(j.location || "").toLowerCase().includes(locationFilter.toLowerCase())) return false;
      return true;
    });
  };

  const filteredRecommended = filterJobs(recommendedJobs);
  const filteredBrowse = filterJobs(browseJobs);
  const jobsToShow = showRecommended ? filteredRecommended : filteredBrowse;

  const JobCard = ({ job, showMatch }: { job: Job; showMatch?: boolean }) => (
    <Card hover className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white">{job.title}</h3>
            <div className="flex items-center gap-1 shrink-0">
              {job.source === "platform" && <SaveJobButton jobId={job.id} />}
              <ShareJobButton jobId={job.id} jobTitle={job.title} url={job.url} />
              {job.suggested_for_you && (
                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-md text-xs font-medium" title="AI suggests you try this role based on your resume">
                  Suggested for you
                </span>
              )}
              {showMatch && job.match_score != null && (
                <span className="px-2.5 py-1 bg-[var(--accent-dim)] text-[var(--accent)] rounded-[var(--radius-sm)] text-[11px] font-semibold uppercase tracking-wider">
                  {job.match_score}% match
                </span>
              )}
            </div>
          </div>
          {job.company && <p className="text-sm text-zinc-400 mt-0.5">{job.company}</p>}
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-zinc-500">
            {job.location && <span>{job.location}</span>}
            {job.remote && <span className="text-teal-400 font-medium">Remote</span>}
            {job.source === "adzuna" && <span className="text-zinc-600">via Adzuna</span>}
          </div>
          {showMatch && job.match_reason ? (
            <p className="mt-2 text-xs text-zinc-500 line-clamp-2">{job.match_reason}</p>
          ) : null}
        </div>
        {job.source === "platform" ? (
          <Link href={`/jobs/${job.id}`} className="self-start px-4 py-2 bg-teal-500 text-black text-sm font-semibold rounded-lg hover:bg-teal-400 transition-colors shrink-0">
            View & apply
          </Link>
        ) : (
          <a href={job.url} target="_blank" rel="noopener noreferrer" className="self-start px-4 py-2 bg-teal-500 text-black text-sm font-semibold rounded-lg hover:bg-teal-400 transition-colors shrink-0">
            View source →
          </a>
        )}
      </div>
    </Card>
  );

  const hasResume = !!profile?.resume_parsed_data;
  const profileCompleteness = profile
    ? Math.round(
        [
          !!profile.full_name,
          !!profile.location || (profile.city || profile.state || profile.country),
          profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0,
          hasResume,
          !!profile.work_preference,
          !!profile.work_type,
        ].filter(Boolean).length * (100 / 6)
      )
    : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-white/5 rounded w-64" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-white/5 rounded-xl" />
              ))}
            </div>
            <div className="h-40 bg-white/5 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="text-zinc-400 mt-1">
          {hasResume ? "AI-matched jobs based on your resume." : "Upload your resume for AI job matching."}
        </p>
        {!hasResume && (
          <Link href="/profile/candidate" className="mt-4 inline-block text-teal-400 hover:text-teal-300 font-medium">
            Upload resume →
          </Link>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setShowRecommended(true)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${showRecommended ? "bg-teal-500/20 text-teal-400" : "text-zinc-400 hover:text-white"}`}
              >
                Recommended
              </button>
              <button
                onClick={() => setShowRecommended(false)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${!showRecommended ? "bg-teal-500/20 text-teal-400" : "text-zinc-400 hover:text-white"}`}
              >
                Browse all
              </button>
            </div>
            <div className="flex gap-2 flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
              <input
                type="text"
                placeholder="Location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-32 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>
          </div>

          {jobsToShow.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-zinc-400 font-medium">{showRecommended ? "No matches yet" : "No jobs found"}</p>
              <p className="text-zinc-500 text-sm mt-1">
                {showRecommended ? "Upload your resume or browse all jobs." : "Try adjusting filters."}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {jobsToShow.map((job) => (
                <JobCard key={`${job.source}-${job.id}`} job={job} showMatch={hasResume} />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Your Profile</h2>
          <Card className="p-6">
            {profile ? (
              <>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-zinc-400">Profile completeness</span>
                    <span className="text-teal-400 font-medium">{profileCompleteness}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all"
                      style={{ width: `${profileCompleteness}%` }}
                    />
                  </div>
                  {profileCompleteness < 100 && (
                    <p className="text-xs text-zinc-500 mt-1.5">
                      Add location, skills, and resume to improve your match score
                    </p>
                  )}
                </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</p>
                  <p className="font-medium text-white mt-0.5">{profile.full_name}</p>
                </div>
                {profile.headline ? (
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Headline</p>
                    <p className="text-zinc-300 mt-0.5 text-sm">{profile.headline}</p>
                  </div>
                ) : null}
                {profile.location ? (
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Location</p>
                    <p className="text-zinc-300 mt-0.5">{profile.location}</p>
                  </div>
                ) : null}
                {profile.age ? (
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Age</p>
                    <p className="text-zinc-300 mt-0.5">{profile.age}</p>
                  </div>
                ) : null}
                {profile.work_preference ? (
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Work preference</p>
                    <p className="text-zinc-300 mt-0.5 capitalize">{profile.work_preference.replace("_", " ")}</p>
                  </div>
                ) : null}
                {profile.work_type ? (
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Work type</p>
                    <p className="text-zinc-300 mt-0.5 capitalize">{profile.work_type.replace("_", " ")}</p>
                  </div>
                ) : null}
                {profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0 ? (
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skills.map((s: string) => (
                        <span key={s} className="px-2.5 py-1 bg-teal-500/20 text-teal-400 rounded-md text-xs font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {profile.resume_parsed_data ? (
                  <p className="text-xs text-teal-400">✓ Resume parsed by AI</p>
                ) : null}
                <Link href="/profile/candidate" className="w-full mt-4 py-2.5 text-sm font-medium text-teal-400 hover:text-teal-300 border border-teal-500/30 rounded-lg hover:bg-teal-500/5 transition-colors inline-block text-center">
                  Edit profile & upload resume
                </Link>
                <Link href="/dashboard/candidate/applications" className="w-full mt-2 py-2.5 text-sm font-medium text-zinc-400 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors inline-block text-center">
                  My applications →
                </Link>
                <Link href="/dashboard/candidate/saved" className="w-full mt-2 py-2.5 text-sm font-medium text-zinc-400 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors inline-block text-center">
                  Saved jobs →
                </Link>
              </div>
            </>
            ) : (
              <p className="text-zinc-500 text-sm">Loading...</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
