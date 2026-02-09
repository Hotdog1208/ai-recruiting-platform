"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

type SaveJobButtonProps = {
  jobId: string;
  className?: string;
};

export function SaveJobButton({ jobId, className = "" }: SaveJobButtonProps) {
  const { user, role } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || role !== "candidate") return;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    fetch(`${baseUrl}/saved-jobs/check?job_id=${jobId}&user_id=${user.id}`)
      .then((r) => r.json())
      .then((d) => setSaved(d.saved))
      .catch(() => {});
  }, [jobId, user?.id, role]);

  const toggle = async () => {
    if (!user || role !== "candidate") return;
    setLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    try {
      if (saved) {
        await fetch(`${baseUrl}/saved-jobs?job_id=${jobId}&user_id=${user.id}`, { method: "DELETE" });
        setSaved(false);
      } else {
        await fetch(`${baseUrl}/saved-jobs?job_id=${jobId}&user_id=${user.id}`, { method: "POST" });
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
      className={`p-2 rounded-lg transition-colors ${saved ? "text-teal-400 hover:text-teal-300" : "text-zinc-400 hover:text-white"} ${className}`}
      title={saved ? "Unsave job" : "Save job"}
    >
      <svg className="w-5 h-5" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}
