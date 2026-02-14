"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

type SaveJobButtonProps = {
  jobId: string;
  className?: string;
};

export function SaveJobButton({ jobId, className = "" }: SaveJobButtonProps) {
  const { user, role, session } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || role !== "candidate" || !session?.access_token) return;
    apiGet<{ saved: boolean }>(`/saved-jobs/check?job_id=${jobId}`, session.access_token)
      .then((d) => setSaved(d.saved))
      .catch(() => {});
  }, [jobId, user, role, session?.access_token]);

  const toggle = async () => {
    if (!user || role !== "candidate" || !session?.access_token) return;
    setLoading(true);
    try {
      if (saved) {
        await apiDelete(`/saved-jobs?job_id=${jobId}`, session.access_token);
        setSaved(false);
      } else {
        await apiPost(`/saved-jobs?job_id=${jobId}`, {}, session.access_token);
        setSaved(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (role !== "candidate") return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`p-2 rounded-lg transition-colors duration-200 ${saved ? "text-[var(--accent)] hover:text-[var(--accent-hover)]" : "text-[var(--text-muted)] hover:text-white"} ${className}`}
      title={saved ? "Unsave job" : "Save job"}
    >
      <svg className="w-5 h-5" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}
