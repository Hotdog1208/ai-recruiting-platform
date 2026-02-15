"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { SaveJobButton } from "@/components/jobs/SaveJobButton";
import { ShareJobButton } from "@/components/jobs/ShareJobButton";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { JobCardSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type Job = {
  id: string;
  source: string;
  title: string;
  company?: string | null;
  location?: string | null;
  remote?: boolean | null;
  url?: string;
  match_score?: number;
  match_reason?: string;
  suggested_for_you?: boolean;
};

type Application = {
  id: string;
  job_id: string;
  job_title: string | null;
  job_location: string | null;
  job_remote: boolean | null;
  status: string;
  created_at: string | null;
};

type CandidateProfile = {
  id: string;
  full_name: string;
  location: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  headline?: string | null;
  skills: string[] | null;
  resume_parsed_data?: unknown;
  work_preference?: string | null;
  work_type?: string | null;
};

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return d.toLocaleDateString();
}

function CircularProgress({
  value,
  size = 120,
}: {
  value: number;
  size?: number;
}) {
  const r = size / 2 - 8;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="circular-progress-wrapper" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#00e676"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="progress-text" style={{ fontSize: size * 0.2 }}>{value}%</span>
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
    <div className="stat-card stat-card-candidate">
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

function StatusCard({
  count,
  icon,
  label,
  description,
  color,
}: {
  status: string;
  count: number;
  icon: string;
  label: string;
  description: string;
  color: string;
}) {
  return (
    <div className={`status-card status-card-${color}`}>
      <div className="status-card-header">
        <span className="status-card-icon">{icon}</span>
        <span className="status-card-count">{count}</span>
      </div>
      <p className="status-card-label">{label}</p>
      <p className="status-card-desc">{description}</p>
    </div>
  );
}

function RecommendationCard({
  icon,
  title,
  description,
  action,
  impact,
}: {
  type: string;
  icon: string;
  title: string;
  description: string;
  action: string;
  impact?: string;
}) {
  return (
    <div className="recommendation-card">
      <span className="rec-icon">{icon}</span>
      <div className="rec-body">
        <h4>{title}</h4>
        <p>{description}</p>
        {impact && <span className="rec-impact">{impact}</span>}
        <button type="button" className="rec-action">{action}</button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "status-yellow" },
    shortlisted: { label: "Reviewing", className: "status-blue" },
    reviewed: { label: "Reviewing", className: "status-blue" },
    interview: { label: "Interview", className: "status-purple" },
    accepted: { label: "Offer", className: "status-green" },
    rejected: { label: "Rejected", className: "status-red" },
  };
  const c = config[status] || config.pending;
  return <span className={`status-badge ${c.className}`}>{c.label}</span>;
}

const RECOMMENDED_SKILLS = [
  { name: "React Native", impactPercent: 23 },
  { name: "TypeScript", impactPercent: 18 },
  { name: "AWS", impactPercent: 15 },
];

const AI_RECOMMENDATIONS = [
  {
    type: "profile",
    icon: "✍️",
    title: "Improve Your Profile",
    description: "Add a professional summary to increase profile views by 40%",
    action: "Add Summary",
  },
  {
    type: "skills",
    icon: "🎓",
    title: "Skill Recommendations",
    description: "Learning React Native would increase job matches by 23%",
    action: "View Learning Resources",
    impact: "+23% matches",
  },
  {
    type: "application",
    icon: "📧",
    title: "Follow Up Reminder",
    description: "Follow up on recent applications to show continued interest",
    action: "Send Follow-up",
  },
];

export default function CandidateDashboardPage() {
  const { user, session } = useAuth();
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user || !session?.access_token) return;
    setLoading(true);
    try {
      const [profileRes, appsRes, recRes] = await Promise.all([
        apiGet<CandidateProfile>(
          `/candidates/by-user/${user.id}`,
          session.access_token
        ).catch(() => null),
        apiGet<Application[]>(
          "/applications/by-candidate/me",
          session.access_token
        ).catch(() => []),
        apiGet<Job[]>(`/matching/recommended`, session.access_token).catch(
          () => []
        ),
      ]);
      setProfile(profileRes ?? null);
      setApplications(Array.isArray(appsRes) ? appsRes : []);
      setRecommendedJobs(Array.isArray(recRes) ? recRes : []);
    } catch {
      setRecommendedJobs([]);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [user, session?.access_token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const profileCompleteness = profile
    ? Math.round(
        [
          !!profile.full_name,
          !!profile.location ||
            (profile.city || profile.state || profile.country),
          profile.skills && profile.skills.length > 0,
          !!profile.resume_parsed_data,
          !!profile.work_preference,
          !!profile.work_type,
        ].filter(Boolean).length *
          (100 / 6)
      )
    : 0;

  const missingItems: string[] = [];
  if (!profile?.headline) missingItems.push("professional summary");
  if (!profile?.skills?.length) missingItems.push("skills");
  if (!profile?.resume_parsed_data) missingItems.push("resume");
  if (!profile?.work_preference) missingItems.push("work preference");

  const pendingCount = applications.filter((a) => a.status === "pending").length;
  const reviewingCount = applications.filter(
    (a) => a.status === "shortlisted" || a.status === "reviewed"
  ).length;
  const interviewCount = applications.filter(
    (a) => a.status === "interview"
  ).length;
  const offerCount = applications.filter((a) => a.status === "accepted").length;

  const appsThisWeek = applications.filter((a) => {
    if (!a.created_at) return false;
    const d = new Date(a.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }).length;

  const displayName =
    profile?.full_name || user?.user_metadata?.full_name || "there";
  const firstName = displayName.split(" ")[0] || displayName;

  const weeklyActivity = [0, 0, 0, 0];
  applications.forEach((a) => {
    if (!a.created_at) return;
    const d = new Date(a.created_at);
    const now = new Date();
    const weeksAgo = Math.floor(
      (now.getTime() - d.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    if (weeksAgo >= 0 && weeksAgo < 4) {
      const idx = 3 - weeksAgo;
      if (idx >= 0) weeklyActivity[idx]++;
    }
  });

  const doughnutData = {
    labels: ["Pending", "Reviewing", "Interview", "Rejected"],
    datasets: [
      {
        data: [
          pendingCount,
          reviewingCount,
          interviewCount,
          applications.filter((a) => a.status === "rejected").length,
        ],
        backgroundColor: ["#fbbf24", "#3b82f6", "#a855f7", "#ef4444"],
        borderWidth: 0,
      },
    ],
  };

  const lineData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Applications",
        data: weeklyActivity,
        borderColor: "#00e676",
        backgroundColor: "rgba(0, 230, 118, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
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

  const currentSkills = profile?.skills?.slice(0, 10) || [];
  const salaryMin = 90;
  const salaryMax = 120;
  const marketAverage = 105;
  const topEarners = 150;
  const role = "Software Engineer";
  const location = profile?.location || "Your area";

  if (loading) {
    return (
      <div className="candidate-dashboard candidate-dashboard-loading">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-white/5 rounded w-72 mb-6" />
          <div className="stats-grid-candidate grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-white/5 rounded-2xl" />
            ))}
          </div>
          <div className="space-y-4">
            <JobCardSkeleton />
            <JobCardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="candidate-dashboard">
      {/* Job seeker hero: find your next role */}
      <div className="candidate-welcome">
        <h1>Find your next role, {firstName}</h1>
        <p>
          {recommendedJobs.length > 0
            ? `${recommendedJobs.length} jobs match your profile. Apply and get hired.`
            : "Complete your profile to see jobs that fit you."}
        </p>
        <Link href="/jobs" className="candidate-hero-cta">
          {recommendedJobs.length > 0 ? "Browse jobs that match you" : "Browse all jobs"}
        </Link>
      </div>

      {/* So employers can find you */}
      <div className="profile-completion-card">
        <CircularProgress value={profileCompleteness} size={120} />
        <div>
          <h3>Help employers find you</h3>
          <p>{profileCompleteness}% complete — more complete profiles get more views.</p>
          {profileCompleteness < 100 && (
            <Link href="/profile/candidate" className="btn-complete-profile">
              Complete my profile
            </Link>
          )}
          {missingItems.length > 0 && (
            <ul className="missing-items">
              {missingItems.map((item) => (
                <li key={item}>• Add {item}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Section 3: Key Stats Grid */}
      <div className="stats-grid-candidate">
        <StatCard
          icon="📝"
          title="Total Applications"
          value={applications.length}
          subtitle="Submitted"
          trend={appsThisWeek > 0 ? `+${appsThisWeek} this week` : "No activity this week"}
        />
        <StatCard
          icon="👁️"
          title="Profile Views"
          value={0}
          subtitle="Last 30 days"
          trend="+8 since last week"
        />
        <StatCard
          icon="🎯"
          title="Job Matches"
          value={recommendedJobs.length}
          subtitle="Perfect fits"
          trend="Updated today"
        />
        <StatCard
          icon="📅"
          title="Interviews"
          value={interviewCount}
          subtitle="Scheduled"
          trend={
            interviewCount > 0 ? "Next: See applications" : "None scheduled"
          }
        />
      </div>

      {/* Section 4: Application Status Breakdown */}
      <div className="application-status-section">
        <h2>Where my applications stand</h2>
        <div className="status-cards-grid">
          <StatusCard
            status="pending"
            count={pendingCount}
            icon="⏳"
            label="Pending Review"
            description="Waiting for employer response"
            color="yellow"
          />
          <StatusCard
            status="reviewing"
            count={reviewingCount}
            icon="👀"
            label="Under Review"
            description="Employer is reviewing"
            color="blue"
          />
          <StatusCard
            status="interview"
            count={interviewCount}
            icon="🗣️"
            label="Interview Stage"
            description="Scheduled or completed"
            color="purple"
          />
          <StatusCard
            status="offer"
            count={offerCount}
            icon="🎉"
            label="Offers"
            description="Awaiting your decision"
            color="green"
          />
        </div>
      </div>

      {/* Section 5: AI Career Coach Panel */}
      <div className="ai-coach-section">
        <div className="coach-header">
          <span className="coach-icon">🤖</span>
          <h2>AI Career Coach Recommendations</h2>
        </div>
        <div className="recommendations-list">
          {AI_RECOMMENDATIONS.map((rec, i) => (
            <RecommendationCard
              key={i}
              type={rec.type}
              icon={rec.icon}
              title={rec.title}
              description={rec.description}
              action={rec.action}
              impact={rec.impact}
            />
          ))}
        </div>
      </div>

      {/* Section 6: Recent Applications Timeline */}
      <div className="applications-timeline-section">
        <h2>My recent applications</h2>
        <div className="timeline">
          {applications.slice(0, 5).map((app) => (
            <div key={app.id} className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-content">
                <div className="app-header">
                  <div className="company-info">
                    <div className="company-logo-placeholder">💼</div>
                    <div>
                      <h4>{app.job_title || "Untitled"}</h4>
                      <p>
                        {[app.job_location, app.job_remote && "Remote"]
                          .filter(Boolean)
                          .join(" • ") || "—"}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                <div className="app-meta">
                  <span>Applied {formatTimeAgo(app.created_at)}</span>
                  {!!profile?.resume_parsed_data && (
                    <>
                      <span>•</span>
                      <span className="match-score">—% match</span>
                    </>
                  )}
                </div>
                <div className="app-actions">
                  <Link href={`/jobs/${app.job_id}`} className="btn-view">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        {applications.length === 0 && (
          <p className="timeline-empty">
            No applications yet.{" "}
            <Link href="/jobs" className="link-green">
              Browse jobs
            </Link>{" "}
            to get started.
          </p>
        )}
      </div>

      {/* Section 7: Recommended Jobs Carousel */}
      <div className="recommended-jobs-section">
        <h2>Jobs recommended for me</h2>
        <p>Based on my skills and experience</p>
        <div className="jobs-carousel">
          {recommendedJobs.length === 0 ? (
            <Card className="p-8">
              <EmptyState
                title="No matches yet"
                description="Upload your resume for AI job matching."
                icon="📋"
                action={
                  <Link href="/jobs" className="btn-primary-candidate">
                    Browse Jobs
                  </Link>
                }
              />
            </Card>
          ) : (
            recommendedJobs.slice(0, 6).map((job) => (
              <Card key={`${job.source}-${job.id}`} hover className="job-card-candidate">
                <div className="job-card-inner">
                  <h3>{job.title}</h3>
                  {job.company && <p className="job-company">{job.company}</p>}
                  <div className="job-meta">
                    {job.location && <span>{job.location}</span>}
                    {job.remote && <span className="remote">Remote</span>}
                  </div>
                  {job.match_score != null && (
                    <span className="match-badge">{job.match_score}% match</span>
                  )}
                  <div className="job-card-actions">
                    {job.source === "platform" ? (
                      <>
                        <SaveJobButton jobId={job.id} />
                        <ShareJobButton jobId={job.id} jobTitle={job.title} url={job.url} />
                        <Link href={`/jobs/${job.id}`} className="btn-apply">
                          View & apply
                        </Link>
                      </>
                    ) : (
                      <a href={job.url} target="_blank" rel="noopener noreferrer" className="btn-apply">
                        View source →
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Section 8: Skills Gap Analysis */}
      <div className="skills-section">
        <h2>Skills Analysis</h2>
        <div className="skills-grid">
          <div className="skills-card current-skills">
            <h3>Your Current Skills</h3>
            <div className="skills-tags">
              {currentSkills.length > 0 ? (
                currentSkills.map((skill) => (
                  <span key={skill} className="skill-tag">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="no-skills">Add skills in your profile</p>
              )}
            </div>
          </div>
          <div className="skills-card recommended-skills">
            <h3>🎯 Skills to Add</h3>
            <div className="skill-recommendations">
              {RECOMMENDED_SKILLS.map((skill) => (
                <div key={skill.name} className="skill-rec">
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-impact">
                    +{skill.impactPercent}% matches
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 9: Salary Insights */}
      <div className="salary-insights-section">
        <h2>💰 Salary Insights</h2>
        <div className="salary-cards">
          <div className="salary-card">
            <p className="label">Your Estimated Range</p>
            <p className="value">${salaryMin}K - ${salaryMax}K</p>
            <p className="note">Based on your experience and skills</p>
          </div>
          <div className="salary-card">
            <p className="label">Market Average</p>
            <p className="value">${marketAverage}K</p>
            <p className="note">For {role} in {location}</p>
          </div>
          <div className="salary-card">
            <p className="label">Top 10% Earns</p>
            <p className="value">${topEarners}K+</p>
            <p className="note">In your field</p>
          </div>
        </div>
      </div>

      {/* Section 10: Activity Chart */}
      <div className="activity-chart-section">
        <h2>Your Job Search Activity</h2>
        <div className="charts-row">
          <div className="chart-container">
            <h3>Applications Over Time</h3>
            <div className="chart-inner">
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>
          <div className="chart-container">
            <h3>Application Status</h3>
            <div className="chart-inner">
              <Doughnut data={doughnutData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
