"use client";

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
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

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
  skills: string[] | null;
  resume_parsed_data?: unknown;
  work_preference?: string | null;
  work_type?: string | null;
};

type DashboardOverviewProps = {
  user: User;
  profile: CandidateProfile | null;
  applications: Application[];
  /** Count of AI-recommended matching jobs */
  matchingJobsCount?: number;
};

function StatCard({
  icon,
  title,
  value,
  subtitle,
  trend,
  color,
}: {
  icon: string;
  title: string;
  value: number;
  subtitle: string;
  trend?: string;
  color: "blue" | "purple" | "green" | "orange";
}) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
        <p className="stat-subtitle">{subtitle}</p>
        {trend && <p className="stat-trend">{trend}</p>}
      </div>
    </div>
  );
}

function CircularProgress({ value }: { value: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="circular-progress">
      <svg width="120" height="120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--accent-primary)"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="progress-text">{value}%</div>
    </div>
  );
}

export default function DashboardOverview({
  user,
  profile,
  applications,
  matchingJobsCount = 0,
}: DashboardOverviewProps) {
  const profileCompleteness = profile
    ? Math.round(
        [
          !!profile.full_name,
          !!profile.location ||
            (profile.city || profile.state || profile.country),
          profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0,
          !!profile.resume_parsed_data,
          !!profile.work_preference,
          !!profile.work_type,
        ].filter(Boolean).length *
          (100 / 6)
      )
    : 0;

  const statusCounts = applications.reduce(
    (acc, app) => {
      const s = app.status === "shortlisted" ? "reviewing" : app.status;
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const pending = statusCounts.pending ?? 0;
  const reviewing = (statusCounts.reviewing ?? 0) + (statusCounts.shortlisted ?? 0);
  const interview = statusCounts.interview ?? 0;
  const rejected = statusCounts.rejected ?? 0;

  const doughnutData = {
    labels: ["Pending", "Reviewing", "Interview", "Rejected"],
    datasets: [
      {
        data: [pending, reviewing, interview, rejected],
        backgroundColor: ["#fbbf24", "#3b82f6", "#10b981", "#ef4444"],
        borderColor: ["#fbbf24", "#3b82f6", "#10b981", "#ef4444"],
        borderWidth: 1,
      },
    ],
  };

  const weeklyActivity: number[] = [0, 0, 0, 0];
  applications.forEach((app) => {
    if (!app.created_at) return;
    const d = new Date(app.created_at);
    const now = new Date();
    const weeksAgo = Math.floor(
      (now.getTime() - d.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    if (weeksAgo >= 0 && weeksAgo < 4) {
      weeklyActivity[3 - weeksAgo]++;
    }
  });

  const lineData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Applications Submitted",
        data: weeklyActivity,
        borderColor: "var(--accent-primary)",
        backgroundColor: "rgba(0, 230, 118, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { color: "rgba(255,255,255,0.8)" },
      },
    },
  };

  const lineOptions = {
    ...chartOptions,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: "rgba(255,255,255,0.6)" },
        grid: { color: "rgba(255,255,255,0.06)" },
      },
      x: {
        ticks: { color: "rgba(255,255,255,0.6)" },
        grid: { color: "rgba(255,255,255,0.06)" },
      },
    },
  };

  const displayName =
    profile?.full_name || user.user_metadata?.full_name || "there";

  return (
    <div className="dashboard-overview">
      {/* Welcome Section */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1>Welcome back, {displayName}!</h1>
          <p>Here&apos;s your job search progress at a glance</p>
        </div>
        <div className="profile-completion">
          <CircularProgress value={profileCompleteness} />
          <div>
            <p className="completion-label">Profile Completeness</p>
            <p className="completion-value">{profileCompleteness}%</p>
            {profileCompleteness < 100 && (
              <Link href="/profile/candidate" className="complete-profile-btn">
                Complete Profile
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon="📝"
          title="Applications"
          value={applications.length}
          subtitle="Total submitted"
          trend={
            applications.length > 0
              ? `${applications.filter((a) => {
                  const d = new Date(a.created_at || 0);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return d > weekAgo;
                }).length} this week`
              : undefined
          }
          color="blue"
        />
        <StatCard
          icon="👁️"
          title="Profile Views"
          value={0}
          subtitle="Last 30 days"
          trend="—"
          color="purple"
        />
        <StatCard
          icon="🎯"
          title="Matching Jobs"
          value={matchingJobsCount}
          subtitle="Based on your profile"
          trend={matchingJobsCount > 0 ? "Updated today" : "Upload resume"}
          color="green"
        />
        <StatCard
          icon="💼"
          title="Interviews"
          value={applications.filter((a) => a.status === "interview").length}
          subtitle="Scheduled"
          trend={
            interview > 0 ? "See applications" : "None upcoming"
          }
          color="orange"
        />
      </div>

      {/* Charts - only show if applications exist */}
      {applications.length > 0 && (
        <div className="dashboard-charts">
          <div className="chart-card">
            <h3>Application Status Breakdown</h3>
            <div className="chart-inner">
              <Doughnut data={doughnutData} options={chartOptions} />
            </div>
          </div>
          <div className="chart-card">
            <h3>Application Activity (Last 30 Days)</h3>
            <div className="chart-inner">
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
