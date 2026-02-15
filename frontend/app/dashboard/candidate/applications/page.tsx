"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api";
import ApplicationsTable from "@/components/candidate/ApplicationsTable";
import { TableRowSkeleton } from "@/components/ui/LoadingSkeleton";

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
  const { user, session } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const apps = await apiGet<Application[]>(
          "/applications/by-candidate/me",
          session?.access_token
        );
        setApplications(Array.isArray(apps) ? apps : []);
      } catch {
        setApplications([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, session?.access_token]);

  if (loading) {
    return (
      <div className="applications-section">
        <div className="section-header mb-6">
          <h2 className="text-xl font-bold text-white m-0">My Applications</h2>
        </div>
        <div className="applications-table-wrapper overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-4 text-xs uppercase tracking-wider opacity-60">Job Title</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider opacity-60">Applied Date</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider opacity-60">Status</th>
                <th className="text-left p-4 text-xs uppercase tracking-wider opacity-60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">My Applications</h1>
        <p className="text-zinc-400 m-0">
          Track the status of your job applications in one place.
        </p>
      </div>
      <ApplicationsTable applications={applications} />
    </div>
  );
}
