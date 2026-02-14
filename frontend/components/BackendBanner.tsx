"use client";

import { useState, useEffect } from "react";
import { subscribeBackendStatus, getBackendStatus } from "@/lib/api";

export function BackendBanner() {
  const [status, setStatus] = useState(getBackendStatus());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    return subscribeBackendStatus(setStatus);
  }, []);

  if (status !== "unreachable" || dismissed) return null;

  return (
    <div
      role="alert"
      className="bg-red-500/15 border-b border-red-500/30 text-red-200 text-sm px-4 py-2.5 flex items-center justify-between gap-4"
    >
      <span className="flex-1">Backend not connected. Some features may be unavailable.</span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 text-red-400 hover:text-red-300 underline focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
      >
        Dismiss
      </button>
    </div>
  );
}
