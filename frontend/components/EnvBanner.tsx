"use client";

import { useState, useEffect } from "react";
import { getEnvStatus, getSetupMessage, logDevEnvWarnings } from "@/lib/env";

export function EnvBanner() {
  const [status, setStatus] = useState<ReturnType<typeof getEnvStatus>>("ok");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setStatus(getEnvStatus());
    logDevEnvWarnings();
  }, []);

  if (status !== "missing_supabase" || dismissed) return null;

  const message = getSetupMessage();
  return (
    <div
      role="alert"
      className="bg-amber-500/15 border-b border-amber-500/30 text-amber-200 text-sm px-4 py-2.5 flex items-center justify-between gap-4"
    >
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 text-amber-400 hover:text-amber-300 underline focus:outline-none focus:ring-2 focus:ring-amber-400 rounded"
      >
        Dismiss
      </button>
    </div>
  );
}
