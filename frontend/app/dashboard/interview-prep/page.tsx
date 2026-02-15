"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getInterviewStatus } from "@/lib/interview";
import { InterviewSimulator } from "@/components/interview/InterviewSimulator";

export default function InterviewPrepPage() {
  const { session } = useAuth();
  const token = session?.access_token ?? null;
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    getInterviewStatus(token).then((r) => setAvailable(r.available)).catch(() => setAvailable(false));
  }, [token]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-[var(--text)] mb-2">Interview prep</h1>
      <p className="text-[var(--text-muted)] text-sm mb-6">
        Practice with AI-generated questions and get instant feedback on your answers.
      </p>
      {available === false && (
        <p className="text-amber-400/90 text-sm mb-4">
          AI interview features are not configured on the server. Questions and feedback will use fallbacks.
        </p>
      )}
      <InterviewSimulator />
    </div>
  );
}
