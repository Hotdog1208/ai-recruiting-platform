"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api";
import { Card } from "@/components/ui/Card";

type Applicant = {
  id: string;
  candidate_id: string;
  candidate_name: string | null;
  candidate_location: string | null;
  candidate_skills: string[] | null;
  candidate_experience: unknown;
  status: string;
  created_at: string | null;
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interview" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

export default function JobApplicantsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, role, loading } = useAuth();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadApplicants = async () => {
    if (!params.id) return;
    const apps = await apiGet<Applicant[]>(`/applications/by-job/${params.id}`);
    setApplicants(apps);
  };

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && role !== "employer") router.push("/dashboard/candidate");
  }, [user, role, loading, router]);

  useEffect(() => {
    if (!params.id) return;
    loadApplicants()
      .catch(() => setApplicants([]))
      .finally(() => setLoadingData(false));
    apiGet<{ title: string }>(`/jobs/${params.id}`)
      .then((j) => setJobTitle(j.title))
      .catch(() => {});
  }, [params.id]);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    setUpdatingId(appId);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    try {
      const res = await fetch(`${baseUrl}/applications/${appId}?status=${newStatus}`, {
        method: "PATCH",
      });
      if (res.ok) {
        setApplicants((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "accepted": return "bg-teal-500/20 text-teal-400 border-teal-500/30";
      case "shortlisted": return "bg-teal-500/20 text-teal-400 border-teal-500/30";
      case "interview": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "rejected": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-zinc-800 text-zinc-400 border-white/10";
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <nav className="bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard/employer" className="text-sm text-teal-400 hover:text-teal-300 font-medium">
            ← Back to dashboard
          </Link>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-white mb-2">Applicants for {jobTitle || "this job"}</h1>
        <p className="text-zinc-400 mb-8">Manage applications and update status. Click to expand candidate profile.</p>

        {loadingData ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl" />
            ))}
          </div>
        ) : applicants.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-zinc-500">No applications yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {applicants.map((a) => (
              <Card key={a.id} className="overflow-hidden">
                <div
                  className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                >
                  <div>
                    <p className="font-medium text-white">{a.candidate_name || "Unknown"}</p>
                    <p className="text-sm text-zinc-500 mt-1">
                      Applied {a.created_at ? new Date(a.created_at).toLocaleDateString() : ""}
                      {a.candidate_location && ` • ${a.candidate_location}`}
                    </p>
                    {a.candidate_skills && Array.isArray(a.candidate_skills) && a.candidate_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {a.candidate_skills.slice(0, 5).map((skill) => (
                          <span key={skill} className="px-2 py-0.5 bg-white/5 rounded text-xs text-zinc-400">
                            {skill}
                          </span>
                        ))}
                        {a.candidate_skills.length > 5 && (
                          <span className="text-xs text-zinc-500">+{a.candidate_skills.length - 5} more</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={a.status}
                      onChange={(e) => handleStatusChange(a.id, e.target.value)}
                      disabled={updatingId === a.id}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border bg-transparent ${statusColor(a.status)}`}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-zinc-900 text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-zinc-500 text-sm">{expandedId === a.id ? "▲" : "▼"}</span>
                  </div>
                </div>
                {expandedId === a.id && (
                  <div className="px-6 pb-6 pt-0 border-t border-white/5">
                    <div className="grid sm:grid-cols-2 gap-6 mt-4">
                      <div>
                        <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Skills</h4>
                        {a.candidate_skills && Array.isArray(a.candidate_skills) && a.candidate_skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {a.candidate_skills.map((skill) => (
                              <span key={skill} className="px-2.5 py-1 bg-teal-500/20 text-teal-400 rounded-md text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-zinc-500 text-sm">—</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Location</h4>
                        <p className="text-zinc-300">{a.candidate_location || "—"}</p>
                      </div>
                      {a.candidate_experience != null ? (
                        <div className="sm:col-span-2">
                          <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Experience</h4>
                          <pre className="text-sm text-zinc-400 bg-zinc-900/50 p-4 rounded-lg overflow-auto max-h-32">
                            {JSON.stringify(a.candidate_experience, null, 2)}
                          </pre>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
