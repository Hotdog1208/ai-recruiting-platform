"use client";

import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { EnvBanner } from "@/components/EnvBanner";
import { BackendBanner } from "@/components/BackendBanner";
import { ToastProvider } from "@/components/ui/Toast";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  logEnvironmentStatus,
  validateEnvironment,
  logDevEnvWarnings,
} from "@/lib/env";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    logDevEnvWarnings();
    logEnvironmentStatus();
    const { ok, missing, invalid } = validateEnvironment();
    if (!ok) {
      if (missing.length)
        console.warn("[env] Missing:", missing.join(", "));
      if (invalid.length)
        console.warn("[env] Placeholder/invalid:", invalid.join(", "));
    }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <ScrollProgress />
          <EnvBanner />
          <BackendBanner />
          {children}
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
