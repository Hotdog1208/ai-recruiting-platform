"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";

type Application = {
  id: string;
  job_id: string;
  job_title: string | null;
  job_location: string | null;
  job_remote: boolean | null;
  status: string;
  created_at: string | null;
};

const ILLUSTRATIONS = {
  emptyApplications:
    "https://illustrations.popsy.co/amber/no-data.svg",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<
    string,
    { label: string; color: string; icon: string }
  > = {
    pending: { label: "Pending", color: "yellow", icon: "⏳" },
    reviewed: { label: "Reviewing", color: "blue", icon: "👀" },
    shortlisted: { label: "Shortlisted", color: "purple", icon: "✨" },
    interview: { label: "Interview", color: "purple", icon: "🗣️" },
    accepted: { label: "Accepted", color: "green", icon: "✅" },
    rejected: { label: "Rejected", color: "red", icon: "❌" },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`status-badge status-${config.color}`}>
      <span className="badge-icon">{config.icon}</span>
      {config.label}
    </span>
  );
}

type ApplicationsTableProps = {
  applications: Application[];
};

export default function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    let list = [...applications];

    if (statusFilter !== "all") {
      list = list.filter((a) => a.status === statusFilter);
    }

    if (timeFilter !== "all") {
      const now = new Date();
      const cutoff = new Date();
      if (timeFilter === "7") cutoff.setDate(now.getDate() - 7);
      else if (timeFilter === "30") cutoff.setDate(now.getDate() - 30);
      else if (timeFilter === "90") cutoff.setDate(now.getDate() - 90);

      list = list.filter((a) => new Date(a.created_at || 0) >= cutoff);
    }

    return list;
  }, [applications, statusFilter, timeFilter]);

  return (
    <div className="applications-section">
      <div className="section-header">
        <h2>Your Applications</h2>
        <div className="filters">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview">Interview</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            className="filter-select"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="all">All time</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={applications.length === 0 ? "No applications yet" : "No applications match filters"}
          description={
            applications.length === 0
              ? "Start applying to jobs that match your skills and experience."
              : "Try adjusting your filters above."
          }
          icon={applications.length === 0 ? "📭" : undefined}
          imageSrc={applications.length === 0 ? ILLUSTRATIONS.emptyApplications : undefined}
          action={
            applications.length === 0 ? (
              <Link
                href="/jobs"
                className="inline-block px-6 py-3 bg-[var(--accent-primary)] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Browse Jobs
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("all");
                  setTimeFilter("all");
                }}
                className="inline-block px-6 py-3 bg-[var(--accent-primary)] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Clear filters
              </button>
            )
          }
        />
      ) : (
        <div className="applications-table">
          <div className="applications-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div className="job-cell">
                        <p className="job-title">{app.job_title || "Untitled"}</p>
                        <p className="job-meta">
                          {[app.job_location, app.job_remote && "Remote"]
                            .filter(Boolean)
                            .join(" • ") || "—"}
                        </p>
                      </div>
                    </td>
                    <td>
                      <time>{formatDate(app.created_at)}</time>
                    </td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td>
                      <Link href={`/jobs/${app.job_id}`} className="action-btn">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
