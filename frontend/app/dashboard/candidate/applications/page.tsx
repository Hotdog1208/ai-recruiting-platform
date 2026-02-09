"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api";
import { Card } from "@/components/ui/Card";

type Application = {
  id: string;
  job_id: string;
  job_title: string | null;
  job_location: string | null;
  job_remote: boolean | null;
  status: string;
  created_at: string | null;
};

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ id: string } | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const profileRes = await apiGet<{ id: string }>(`/candidates/by-user/${user.id}`);
        setProfile(profileRes);
        const apps = await apiGet<Application[]>(`/applications/by-candidate/${profileRes.id}`);
        setApplications(apps);
      } catch {
        setApplications([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id]);

  const statusColor = (s: string) => {
    switch (s) {
      case "accepted": return "bg-teal-500/20 text-teal-400";
      case "shortlisted": return "bg-teal-500/20 text-teal-400";
      case "interview": return "bg-amber-500/20 text-amber-400";
      case "rejected": return "bg-red-500/20 text-red-400";
      default: return "bg-zinc-800 text-zinc-400";
    }
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case "accepted": return "Accepted";
      case "shortlisted": return "Shortlisted";
      case "interview": return "Interview";
      case "rejected": return "Rejected";
      default: return "Pending";
    }
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
      <h1 className="text-2xl font-bold text-white mb-2">My Applications</h1>
      <p className="text-zinc-400 mb-8">
        Track the status of your job applications in one place.
      </p>

      {applications.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-zinc-400 font-medium">No applications yet</p>
          <p className="text-zinc-500 text-sm mt-1">Apply to jobs from the dashboard or browse page</p>
          <Link href="/dashboard/candidate" className="mt-6 inline-block text-teal-400 hover:text-teal-300 font-medium">
            Browse jobs →
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} hover className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white">{app.job_title || "Unknown"}</h3>
                <div className="mt-1 flex flex-wrap gap-2 text-sm text-zinc-500">
                  {app.job_location && <span>{app.job_location}</span>}
                  {app.job_remote && <span className="text-teal-400">Remote</span>}
                  <span>
                    Applied {app.created_at ? new Date(app.created_at).toLocaleDateString() : ""}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor(app.status)}`}>
                  {statusLabel(app.status)}
                </span>
                <Link
                  href={`/jobs/${app.job_id}`}
                  className="px-4 py-2 text-sm font-medium text-teal-400 border border-teal-500/30 rounded-lg hover:bg-teal-500/10"
                >
                  View job
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
