"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type Job = {
  id: string;
  title: string;
  description?: string | null;
  location: string | null;
  remote: boolean | null;
  created_at?: string;
};

type EmployerProfile = {
  id: string;
  company_name: string;
  industry: string | null;
};

type Applicant = {
  id: string;
  job_id: string;
  job_title?: string;
  candidate_id: string;
  candidate_name: string | null;
  candidate_location: string | null;
  candidate_skills: string[] | null;
  status: string;
  created_at: string | null;
};

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function CircularProgress({
  value,
  size = 80,
}: {
  value: number;
  size?: number;
}) {
  const r = size / 2 - 6;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div
      className="circular-progress employer-match"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="6"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#00e676"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="progress-text employer-progress-text">{value}%</span>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  trend,
}: {
  icon: string;
  title: string;
  value: number | string;
  subtitle: string;
  trend: string;
}) {
  return (
    <div className="stat-card stat-card-employer">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
        <p className="stat-subtitle">{subtitle}</p>
        <p className="stat-trend">{trend}</p>
      </div>
    </div>
  );
}

function PipelineStage({
  icon,
  title,
  count,
  candidates,
}: {
  stage: string;
  icon: string;
  title: string;
  count: number;
  candidates: (Applicant & { job_title?: string })[];
}) {
  return (
    <div className="pipeline-stage">
      <div className="stage-header">
        <span className="stage-icon">{icon}</span>
        <h3>{title}</h3>
        <span className="stage-count">{count}</span>
      </div>
      <div className="stage-candidates">
        {candidates.slice(0, 3).map((c) => (
          <Link
            key={c.id}
            href={`/jobs/${c.job_id}/applicants`}
            className="mini-candidate-card"
          >
            <div className="mini-candidate-avatar">
              {(c.candidate_name || "?")[0]}
            </div>
            <div className="mini-candidate-info">
              <h5>{c.candidate_name || "Unknown"}</h5>
              <p>{c.job_title || "Applied"}</p>
            </div>
            <span className="match-badge">—%</span>
          </Link>
        ))}
      </div>
      {count > 3 && (
        <Link href="/jobs" className="view-all-stage">
          View All ({count})
        </Link>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  change,
  changeLabel,
  isPositive,
}: {
  icon: string;
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  isPositive: boolean;
}) {
  return (
    <div className="metric-card-employer">
      <span className="metric-icon">{icon}</span>
      <div className="metric-body">
        <p className="metric-label">{label}</p>
        <p className="metric-value">{value}</p>
        <p className={`metric-change ${isPositive ? "positive" : "negative"}`}>
          {change >= 0 ? "+" : ""}
          {change} {changeLabel}
        </p>
      </div>
    </div>
  );
}

function FunnelChart({
  stages,
}: {
  stages: { name: string; count: number }[];
}) {
  const max = Math.max(...stages.map((s) => s.count), 1);
  return (
    <div className="funnel-chart">
      {stages.map((s) => (
        <div key={s.name} className="funnel-stage">
          <span className="funnel-label">{s.name}</span>
          <div className="funnel-bar-wrap">
            <div
              className="funnel-bar"
              style={{
                width: `${(s.count / max) * 100}%`,
              }}
            />
            <span className="funnel-count">{s.count}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

const UPCOMING_INTERVIEWS = [
  {
    id: "1",
    date: new Date(Date.now() + 86400000),
    time: "10:00 AM",
    candidateName: "Candidate One",
    position: "Software Engineer",
    type: "Video",
  },
  {
    id: "2",
    date: new Date(Date.now() + 2 * 86400000),
    time: "2:00 PM",
    candidateName: "Candidate Two",
    position: "Frontend Developer",
    type: "Phone",
  },
];

const COMPETITORS = [
  { id: "1", name: "Tech Corp", activeJobs: 12 },
  { id: "2", name: "Startup Inc", activeJobs: 8 },
  { id: "3", name: "Global Solutions", activeJobs: 15 },
];

const TRENDING_ROLES = [
  { title: "Software Engineer", count: 234 },
  { title: "Product Manager", count: 89 },
  { title: "Data Scientist", count: 67 },
];

export default function EmployerDashboardPage() {
  const { user, session } = useAuth();
  const toast = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    location: "",
    remote: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [jobError, setJobError] = useState("");
  const [applicantCounts, setApplicantCounts] = useState<
    Record<string, number>
  >({});
  const [allApplicants, setAllApplicants] = useState<
    (Applicant & { job_title?: string })[]
  >([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user || !session?.access_token) return;
    setLoading(true);
    try {
      const profileRes = await apiGet<EmployerProfile>(
        "/employers/me",
        session.access_token
      ).catch(() => null);
      setProfile(profileRes);
      if (!profileRes?.id) {
        setLoading(false);
        return;
      }
      const jobsRes = await apiGet<Job[]>("/jobs/mine", session.access_token).catch(
        () => []
      );
      setJobs(jobsRes);
      const counts: Record<string, number> = {};
      const applicants: (Applicant & { job_title?: string })[] = [];
      for (const job of jobsRes) {
        try {
          const apps = await apiGet<Applicant[]>(
            `/applications/by-job/${job.id}`,
            session.access_token
          );
          counts[job.id] = apps.length;
          apps.forEach((a) =>
            applicants.push({ ...a, job_title: job.title, job_id: job.id })
          );
        } catch {
          counts[job.id] = 0;
        }
      }
      setApplicantCounts(counts);
      setAllApplicants(
        applicants.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
        )
      );
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user, session?.access_token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadJobs = async () => {
    if (!session?.access_token) return;
    const jobsRes = await apiGet<Job[]>("/jobs/mine", session.access_token);
    setJobs(jobsRes);
    const counts: Record<string, number> = {};
    const applicants: (Applicant & { job_title?: string })[] = [];
    for (const job of jobsRes) {
      try {
        const apps = await apiGet<Applicant[]>(
          `/applications/by-job/${job.id}`,
          session.access_token
        );
        counts[job.id] = apps.length;
        apps.forEach((a) =>
          applicants.push({ ...a, job_title: job.title, job_id: job.id })
        );
      } catch {
        counts[job.id] = 0;
      }
    }
    setApplicantCounts(counts);
    setAllApplicants(
      applicants.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      )
    );
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmitting(true);
    setJobError("");
    try {
      await apiPost(
        "/jobs",
        {
          title: newJob.title.trim(),
          description: newJob.description.trim() || undefined,
          location: newJob.location.trim() || undefined,
          remote: newJob.remote,
        },
        session?.access_token
      );
      setNewJob({ title: "", description: "", location: "", remote: false });
      setShowForm(false);
      loadJobs();
      toast.success("Job created");
    } catch (err) {
      setJobError(
        err instanceof Error ? err.message : "Failed to create job"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Delete this job? Applications will be removed too.")) return;
    setDeletingId(jobId);
    try {
      await apiDelete(`/jobs/${jobId}`, session?.access_token);
      loadJobs();
      toast.success("Job deleted");
    } finally {
      setDeletingId(null);
    }
  };

  const totalApplicants = Object.values(applicantCounts).reduce(
    (a, b) => a + b,
    0
  );
  const pendingApplications = allApplicants.filter(
    (a) => a.status === "pending"
  ).length;
  const newApplications = allApplicants.filter((a) => {
    if (!a.created_at) return false;
    const d = new Date(a.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }).length;

  const getStageCandidates = (stage: string) => {
    if (stage === "new")
      return allApplicants.filter((a) => a.status === "pending");
    if (stage === "reviewing")
      return allApplicants.filter(
        (a) => a.status === "shortlisted" || a.status === "reviewed"
      );
    if (stage === "interview")
      return allApplicants.filter((a) => a.status === "interview");
    if (stage === "offer")
      return allApplicants.filter((a) => a.status === "accepted");
    if (stage === "hired") return [];
    return [];
  };

  const getStageCount = (stage: string) => getStageCandidates(stage).length;

  const companyName = profile?.company_name || "Employer";
  const activeJobs = jobs.length;
  const hiresThisMonth = 0;
  const avgTimeToHire = 21;
  const newJobsThisWeek = 0;

  const lastFourWeeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
  const applicationsPerWeek = [
    12,
    19,
    15,
    Math.max(totalApplicants, 1),
  ];
  const sourceData = [
    Math.max(45, totalApplicants),
    30,
    15,
    10,
  ];
  const lastSixMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const timeToHireData = [28, 25, 22, 21, 20, 21];

  const funnelStages = [
    { name: "Applied", count: Math.max(totalApplicants, 100) },
    { name: "Reviewed", count: Math.floor(totalApplicants * 0.8) || 80 },
    { name: "Interviewed", count: Math.floor(totalApplicants * 0.3) || 30 },
    { name: "Offered", count: Math.floor(totalApplicants * 0.1) || 10 },
    { name: "Hired", count: hiresThisMonth || 8 },
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" as const, labels: { color: "rgba(255,255,255,0.8)" } },
    },
  };
  const lineOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "rgba(255,255,255,0.6)" },
        grid: { color: "rgba(255,255,255,0.06)" },
      },
      x: {
        ticks: { color: "rgba(255,255,255,0.6)" },
        grid: { color: "rgba(255,255,255,0.06)" },
      },
    },
  };

  const avgTimeToFill = 21;
  const costPerHire = 2340;
  const offerAcceptanceRate = 85;
  const qualityScore = 8.2;
  const responseRate = 78;
  const appsPerJob = jobs.length ? Math.round(totalApplicants / jobs.length) : 0;

  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const currentYear = new Date().getFullYear();
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (loading) {
    return (
      <div className="employer-dashboard employer-dashboard-loading">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-white/5 rounded w-72" />
          <div className="stats-grid-employer grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="employer-dashboard">
      {/* Employer hero: fill your open roles */}
      <div className="employer-welcome">
        <h1>Fill your open roles, {companyName}</h1>
        <p>
          {pendingApplications > 0
            ? `${pendingApplications} candidate${pendingApplications === 1 ? "" : "s"} waiting for your review. Review and hire.`
            : "Post jobs to attract candidates. Review applications and move them through your pipeline."}
        </p>
        {pendingApplications > 0 ? (
          <Link
            href={
              allApplicants.find((a) => a.status === "pending")?.job_id
                ? `/jobs/${allApplicants.find((a) => a.status === "pending")?.job_id}/applicants`
                : "/dashboard/employer"
            }
            className="employer-hero-cta"
          >
            Review candidates
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="employer-hero-cta"
          >
            Post a job
          </button>
        )}
        {pendingApplications > 5 && (
          <div className="urgent-banner">
            <span className="urgent-icon">⚡</span>
            <span>
              Review applications to keep candidates engaged
            </span>
          </div>
        )}
      </div>

      {/* Section 2: Recruitment Stats Grid */}
      <div className="stats-grid-employer">
        <StatCard
          icon="💼"
          title="Active Jobs"
          value={activeJobs}
          subtitle="Currently hiring"
          trend={`${newJobsThisWeek} posted this week`}
        />
        <StatCard
          icon="📬"
          title="New Applications"
          value={newApplications}
          subtitle="Last 7 days"
          trend="+12 since yesterday"
        />
        <StatCard
          icon="✅"
          title="Hires This Month"
          value={hiresThisMonth}
          subtitle="Positions filled"
          trend="2 more than last month"
        />
        <StatCard
          icon="⏱️"
          title="Avg Time to Hire"
          value={`${avgTimeToHire} days`}
          subtitle="From post to offer"
          trend="-3 days vs last month"
        />
      </div>

      {/* Post Job Form */}
      {showForm && (
        <Card className="employer-form-card mb-8 p-6">
          <h3 className="font-semibold text-white mb-4">Create new job</h3>
          <form onSubmit={handleCreateJob} className="space-y-5">
            {jobError && (
              <div className="p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">
                {jobError}
              </div>
            )}
            <Input
              label="Job title"
              placeholder="Software Engineer"
              value={newJob.title}
              onChange={(e) =>
                setNewJob((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Description (optional)
              </label>
              <textarea
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-900/50 border border-white/10 text-white placeholder:text-zinc-500 min-h-24"
                placeholder="Brief description..."
                value={newJob.description}
                onChange={(e) =>
                  setNewJob((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <Input
              label="Location"
              placeholder="e.g. New York or Remote"
              value={newJob.location}
              onChange={(e) =>
                setNewJob((prev) => ({ ...prev, location: e.target.value }))
              }
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remote"
                checked={newJob.remote}
                onChange={(e) =>
                  setNewJob((prev) => ({ ...prev, remote: e.target.checked }))
                }
                className="rounded border-white/20 bg-zinc-900 text-[#3b82f6]"
              />
              <label htmlFor="remote" className="text-sm text-zinc-400">
                Remote position
              </label>
            </div>
            <Button
              type="submit"
              isLoading={submitting}
              disabled={submitting}
              className="post-job-btn"
            >
              Post Job
            </Button>
          </form>
        </Card>
      )}

      {/* Section 3: Hiring Pipeline */}
      <div className="hiring-pipeline-section">
        <h2>Your hiring pipeline</h2>
        <div className="pipeline-stages">
          <PipelineStage
            stage="new"
            icon="📥"
            title="New Applications"
            count={getStageCount("new")}
            candidates={getStageCandidates("new")}
          />
          <PipelineStage
            stage="reviewing"
            icon="👀"
            title="Reviewing"
            count={getStageCount("reviewing")}
            candidates={getStageCandidates("reviewing")}
          />
          <PipelineStage
            stage="interview"
            icon="🗣️"
            title="Interview"
            count={getStageCount("interview")}
            candidates={getStageCandidates("interview")}
          />
          <PipelineStage
            stage="offer"
            icon="📝"
            title="Offer Sent"
            count={getStageCount("offer")}
            candidates={getStageCandidates("offer")}
          />
          <PipelineStage
            stage="hired"
            icon="🎉"
            title="Hired"
            count={getStageCount("hired")}
            candidates={getStageCandidates("hired")}
          />
        </div>
      </div>

      {/* Section 4: Active Jobs Table */}
      <div className="active-jobs-section">
        <div className="section-header">
          <h2>Your job postings</h2>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="btn-primary-employer"
          >
            + Post a job
          </button>
        </div>
        <div className="jobs-table-wrap">
          <table className="jobs-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Posted</th>
                <th>Applications</th>
                <th>Views</th>
                <th>Conversion</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-row">
                    No jobs posted yet. Click &quot;+ Post New Job&quot; to get
                    started.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <div className="job-cell">
                        <h4>{job.title}</h4>
                        <p>
                          {[job.location, job.remote && "Remote"]
                            .filter(Boolean)
                            .join(" • ") || "—"}
                        </p>
                      </div>
                    </td>
                    <td>{formatDate(job.created_at)}</td>
                    <td>
                      <div className="app-count">
                        <span className="number">
                          {applicantCounts[job.id] ?? 0}
                        </span>
                        <span className="trend">+0 today</span>
                      </div>
                    </td>
                    <td>—</td>
                    <td>
                      <span className="conversion-rate">—%</span>
                    </td>
                    <td>
                      <span className="status-badge status-active">Active</span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link
                          href={`/jobs/${job.id}/applicants`}
                          className="btn-table"
                          title="View Applications"
                        >
                          👁️
                        </Link>
                        <Link
                          href={`/jobs/${job.id}`}
                          className="btn-table"
                          title="Edit"
                        >
                          ✏️
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={deletingId === job.id}
                          className="btn-table"
                          title="Delete"
                        >
                          {deletingId === job.id ? "…" : "🗑️"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 5: Candidate Review Queue */}
      <div className="review-queue-section">
        <h2>Candidates waiting for your review</h2>
        {pendingApplications === 0 ? (
          <p className="queue-empty">No applications pending review.</p>
        ) : (
          allApplicants
            .filter((a) => a.status === "pending")
            .slice(0, 5)
            .map((app) => (
              <div key={app.id} className="application-review-card">
                <div className="candidate-info">
                  <div className="candidate-avatar-employer">
                    {(app.candidate_name || "?")[0]}
                  </div>
                  <div>
                    <h4>{app.candidate_name || "Unknown"}</h4>
                    <p>Applied for: {app.job_title || "Job"}</p>
                    <p className="applied-time">
                      {formatTimeAgo(app.created_at)}
                    </p>
                  </div>
                </div>
                <div className="candidate-skills">
                  {(app.candidate_skills || []).slice(0, 4).map((skill) => (
                    <span key={skill} className="skill-pill">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="match-score-display">
                  <CircularProgress value={85} size={80} />
                  <p>Match Score</p>
                </div>
                <div className="ai-insights">
                  <h5>🤖 AI Insights</h5>
                  <ul>
                    <li>✓ Strong experience match</li>
                    <li>✓ Skills aligned with role</li>
                  </ul>
                </div>
                <div className="review-actions">
                  <Link
                    href={`/jobs/${app.job_id}/applicants`}
                    className="btn-primary-employer"
                  >
                    View Full Profile
                  </Link>
                  <button type="button" className="btn-success-employer">
                    Schedule Interview
                  </button>
                  <button type="button" className="btn-ghost-employer">
                    Reject
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Section 6: Interview Calendar */}
      <div className="interview-calendar-section">
        <h2>📅 Interview Schedule</h2>
        <div className="calendar-view">
          <div className="calendar-header">
            <button type="button" className="nav-btn">
              ←
            </button>
            <h3>
              {currentMonth} {currentYear}
            </h3>
            <button type="button" className="nav-btn">
              →
            </button>
          </div>
          <div className="calendar-grid">
            {daysOfWeek.map((day) => (
              <div key={day} className="day-header">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }, (_, i) => (
              <div key={i} className="calendar-day">
                <span className="day-number">{i < 28 ? i + 1 : ""}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="upcoming-interviews">
          <h3>Next 7 Days</h3>
          {UPCOMING_INTERVIEWS.map((interview) => (
            <div key={interview.id} className="interview-item">
              <div className="interview-time">
                <span className="date">
                  {formatDate(interview.date.toISOString())}
                </span>
                <span className="time">{interview.time}</span>
              </div>
              <div className="interview-details">
                <h4>{interview.candidateName}</h4>
                <p>Position: {interview.position}</p>
                <p>Type: {interview.type}</p>
              </div>
              <div className="interview-actions">
                <button type="button">View Profile</button>
                <button type="button">Reschedule</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 7: Competitive Intelligence */}
      <div className="competitive-intel-section">
        <h2>🎯 Market Intelligence</h2>
        <div className="intel-grid">
          <div className="intel-card">
            <h3>Similar Companies Hiring</h3>
            <div className="competitors-list">
              {COMPETITORS.map((comp) => (
                <div key={comp.id} className="competitor-item">
                  <div className="competitor-logo">🏢</div>
                  <div>
                    <h4>{comp.name}</h4>
                    <p>{comp.activeJobs} active positions</p>
                  </div>
                  <button type="button" className="btn-small">
                    View Jobs
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="intel-card">
            <h3>Trending Roles in Your Industry</h3>
            <ul className="trending-roles">
              {TRENDING_ROLES.map((role) => (
                <li key={role.title}>
                  <span className="role-name">{role.title}</span>
                  <span className="role-count">
                    {role.count} open positions
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Section 8: Salary Benchmarking */}
      <div className="salary-benchmark-section">
        <h2>💰 Salary Benchmarking</h2>
        <div className="benchmark-cards">
          {jobs.length === 0 ? (
            <p className="benchmark-empty">
              Post jobs to see salary benchmarking.
            </p>
          ) : (
            jobs.slice(0, 3).map((job) => (
              <div key={job.id} className="benchmark-card">
                <h4>{job.title}</h4>
                <div className="salary-comparison">
                  <div className="your-offer">
                    <p className="label">Your Offer</p>
                    <p className="amount">$—K</p>
                  </div>
                  <div className="market-avg">
                    <p className="label">Market Average</p>
                    <p className="amount">$105K</p>
                  </div>
                  <div className="competitiveness">
                    <span className="competitive">✓ Competitive</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Section 9: Recruitment Analytics */}
      <div className="analytics-section-employer">
        <h2>📈 Recruitment Analytics</h2>
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Applications Over Time</h3>
            <div className="chart-inner">
              <Line
                data={{
                  labels: lastFourWeeks,
                  datasets: [
                    {
                      label: "Applications",
                      data: applicationsPerWeek,
                      borderColor: "#3b82f6",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      tension: 0.4,
                      fill: true,
                    },
                  ],
                }}
                options={lineOptions}
              />
            </div>
          </div>
          <div className="chart-card">
            <h3>Candidate Source</h3>
            <div className="chart-inner">
              <Doughnut
                data={{
                  labels: ["Platform", "LinkedIn", "Indeed", "Referrals"],
                  datasets: [
                    {
                      data: sourceData,
                      backgroundColor: [
                        "#00e676",
                        "#3b82f6",
                        "#fbbf24",
                        "#a855f7",
                      ],
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </div>
          <div className="chart-card">
            <h3>Time to Hire Trend</h3>
            <div className="chart-inner">
              <Bar
                data={{
                  labels: lastSixMonths,
                  datasets: [
                    {
                      label: "Days",
                      data: timeToHireData,
                      backgroundColor: "#3b82f6",
                    },
                  ],
                }}
                options={lineOptions}
              />
            </div>
          </div>
          <div className="chart-card">
            <h3>Funnel Conversion Rates</h3>
            <div className="chart-inner funnel-inner">
              <FunnelChart stages={funnelStages} />
            </div>
          </div>
        </div>
      </div>

      {/* Section 10: Key Metrics */}
      <div className="key-metrics-section">
        <h2>Key Performance Indicators</h2>
        <div className="metrics-grid">
          <MetricCard
            icon="⏱️"
            label="Avg Time to Fill"
            value={`${avgTimeToFill} days`}
            change={-3}
            changeLabel="vs last month"
            isPositive={true}
          />
          <MetricCard
            icon="💰"
            label="Cost per Hire"
            value={`$${costPerHire}`}
            change={150}
            changeLabel="vs last month"
            isPositive={false}
          />
          <MetricCard
            icon="✅"
            label="Offer Acceptance Rate"
            value={`${offerAcceptanceRate}%`}
            change={5}
            changeLabel="vs last month"
            isPositive={true}
          />
          <MetricCard
            icon="📊"
            label="Quality of Hire"
            value={`${qualityScore}/10`}
            change={0.5}
            changeLabel="vs last month"
            isPositive={true}
          />
          <MetricCard
            icon="👥"
            label="Candidate Response Rate"
            value={`${responseRate}%`}
            change={-2}
            changeLabel="vs last month"
            isPositive={false}
          />
          <MetricCard
            icon="🎯"
            label="Applications per Job"
            value={String(appsPerJob)}
            change={8}
            changeLabel="vs last month"
            isPositive={true}
          />
        </div>
      </div>
    </div>
  );
}
