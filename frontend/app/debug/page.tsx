"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { testSupabaseConnection } from "@/lib/supabase";

type ServiceStatus = "healthy" | "error" | "missing";

type HealthData = {
  timestamp: string;
  status: "healthy" | "degraded" | "error";
  services: {
    backend: { status: ServiceStatus; message?: string };
    backendConfig?: Record<string, boolean>;
    supabase: { status: ServiceStatus; configured: boolean };
    stripe: { status: ServiceStatus; configured: boolean };
  };
  error?: string;
};

export default function DebugPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [supabaseOk, setSupabaseOk] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const [res, supabaseResult] = await Promise.all([
          fetch("/api/health").then((r) => r.json()),
          testSupabaseConnection(),
        ]);
        if (!cancelled) {
          setHealth(res as HealthData);
          setSupabaseOk(supabaseResult);
        }
      } catch (e) {
        if (!cancelled) {
          setHealth({
            timestamp: new Date().toISOString(),
            status: "error",
            services: {
              backend: { status: "error", message: "Failed to fetch" },
              supabase: { status: "error", configured: false },
              stripe: { status: "missing", configured: false },
            },
            error: e instanceof Error ? e.message : String(e),
          });
          setSupabaseOk(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-8 font-mono">
        <p>Loading diagnostics…</p>
      </div>
    );
  }

  const statusColor =
    health?.status === "healthy"
      ? "text-[var(--accent-primary)]"
      : health?.status === "degraded"
        ? "text-amber-400"
        : "text-red-400";

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-6 sm:p-8 font-mono">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-block mb-8 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold mb-2">System diagnostics</h1>
        <p className="text-[var(--text-secondary)] text-sm mb-8">
          Last checked: {health?.timestamp ?? "—"}
        </p>

        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--border)] p-6 bg-[var(--bg-secondary)]">
            <h2 className="text-lg font-semibold mb-2">
              Overall status:{" "}
              <span className={statusColor}>{health?.status ?? "—"}</span>
            </h2>
          </div>

          {health?.services && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Services</h2>

              {/* Backend */}
              <div
                className={`rounded-xl border p-6 ${
                  health.services.backend.status === "healthy"
                    ? "border-[var(--accent-primary)]/30 bg-[var(--accent-dim)]/30"
                    : "border-[var(--border)] bg-[var(--bg-secondary)]"
                }`}
              >
                <h3 className="font-semibold uppercase text-sm tracking-wider mb-2">
                  Backend API
                </h3>
                <p>
                  Status:{" "}
                  {health.services.backend.status === "healthy" ? (
                    <span className="text-[var(--accent-primary)]">Healthy</span>
                  ) : (
                    <span className="text-amber-400/90">
                      Error
                      {health.services.backend.message
                        ? ` — ${health.services.backend.message}`
                        : ""}
                    </span>
                  )}
                </p>
                {health.services.backendConfig && (
                  <ul className="mt-3 text-sm text-[var(--text-secondary)] space-y-1">
                    {Object.entries(health.services.backendConfig).map(
                      ([key, value]) => (
                        <li key={key}>
                          {key}: {value ? "✓" : "—"}
                        </li>
                      )
                    )}
                  </ul>
                )}
              </div>

              {/* Supabase */}
              <div
                className={`rounded-xl border p-6 ${
                  supabaseOk === true
                    ? "border-[var(--accent-primary)]/30 bg-[var(--accent-dim)]/30"
                    : "border-[var(--border)] bg-[var(--bg-secondary)]"
                }`}
              >
                <h3 className="font-semibold uppercase text-sm tracking-wider mb-2">
                  Supabase
                </h3>
                <p>
                  Configured:{" "}
                  {health.services.supabase.configured ? "Yes" : "No"}
                </p>
                <p>
                  Connection:{" "}
                  {supabaseOk === true ? (
                    <span className="text-[var(--accent-primary)]">OK</span>
                  ) : supabaseOk === false ? (
                    <span className="text-amber-400/90">Failed or not configured</span>
                  ) : (
                    "—"
                  )}
                </p>
              </div>

              {/* Stripe */}
              <div
                className={`rounded-xl border p-6 ${
                  health.services.stripe.configured
                    ? "border-[var(--accent-primary)]/30 bg-[var(--accent-dim)]/30"
                    : "border-[var(--border)] bg-[var(--bg-secondary)]"
                }`}
              >
                <h3 className="font-semibold uppercase text-sm tracking-wider mb-2">
                  Stripe
                </h3>
                <p>
                  Publishable key:{" "}
                  {health.services.stripe.configured ? (
                    <span className="text-[var(--accent-primary)]">Configured</span>
                  ) : (
                    <span className="text-[var(--text-secondary)]">
                      Not set (optional)
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {health?.error && (
            <div className="rounded-xl border border-red-500/30 p-6 bg-red-950/20">
              <h3 className="font-semibold text-red-400 mb-2">Error</h3>
              <pre className="text-sm whitespace-pre-wrap break-words">
                {health.error}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
