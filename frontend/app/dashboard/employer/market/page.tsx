"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api";
import { Card } from "@/components/ui/Card";

type ExternalJob = {
  id: string;
  source: string;
  title: string;
  company?: string | null;
  location?: string | null;
  description?: string;
  url?: string;
  salary_min?: string;
  salary_max?: string;
};

export default function EmployerMarketPage() {
  const { role } = useAuth();
  const [jobs, setJobs] = useState<ExternalJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<ExternalJob[]>("/external-jobs?refresh=true")
      .then(setJobs)
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  if (role !== "employer") return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/dashboard/employer" className="text-sm text-teal-400 hover:text-teal-300 font-medium mb-6 inline-block">
        ← Back to dashboard
      </Link>
      <h1 className="text-2xl font-bold text-white mb-2">Market jobs</h1>
      <p className="text-zinc-400 mb-8">
        Jobs aggregated from external sources (Adzuna, etc.) to help you see the market.
      </p>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-zinc-500">No external jobs. Add ADZUNA_APP_ID and ADZUNA_APP_KEY to see market data.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="p-6 flex justify-between items-start gap-4">
              <div>
                <h3 className="font-semibold text-white">{job.title}</h3>
                {job.company && <p className="text-sm text-zinc-400">{job.company}</p>}
                <div className="mt-2 flex gap-2 text-sm text-zinc-500">
                  {job.location && <span>{job.location}</span>}
                  {(job.salary_min || job.salary_max) && (
                    <span>
                      {job.salary_min && job.salary_max
                        ? `£${job.salary_min}-${job.salary_max}`
                        : job.salary_min
                        ? `From £${job.salary_min}`
                        : job.salary_max
                        ? `Up to £${job.salary_max}`
                        : ""}
                    </span>
                  )}
                </div>
              </div>
              {job.url && (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm font-medium text-teal-400 border border-teal-500/30 rounded-lg hover:bg-teal-500/10"
                >
                  View source →
                </a>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
