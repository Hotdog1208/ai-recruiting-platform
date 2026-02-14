import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/env";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ServiceStatus = "healthy" | "error" | "missing";

export async function GET() {
  const results: {
    timestamp: string;
    status: "healthy" | "degraded" | "error";
    services: {
      backend: { status: ServiceStatus; message?: string };
      backendConfig?: Record<string, boolean>;
      supabase: { status: ServiceStatus; configured: boolean };
      stripe: { status: ServiceStatus; configured: boolean };
    };
    error?: string;
  } = {
    timestamp: new Date().toISOString(),
    status: "healthy",
    services: {
      backend: { status: "error", message: "not checked" },
      supabase: {
        status: "missing",
        configured: !!(
          process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
        ),
      },
      stripe: {
        status: "missing",
        configured: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim(),
      },
    },
  };

  try {
    const baseUrl = getApiUrl();

    // 1. Backend health
    try {
      const healthRes = await fetch(`${baseUrl}/health`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      const healthData = (await healthRes.json()) as { status?: string };
      if (healthRes.ok && healthData?.status === "ok") {
        results.services.backend = { status: "healthy" };
      } else {
        results.services.backend = {
          status: "error",
          message: healthRes.ok ? "Unexpected response" : `HTTP ${healthRes.status}`,
        };
      }
    } catch (e) {
      results.services.backend = {
        status: "error",
        message: e instanceof Error ? e.message : "Unreachable",
      };
    }

    // 2. Backend debug config (dev only; may 404 in prod)
    try {
      const configRes = await fetch(`${baseUrl}/debug/config`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (configRes.ok) {
        results.services.backendConfig = (await configRes.json()) as Record<string, boolean>;
      }
    } catch {
      // ignore
    }

    // 3. Supabase configured (frontend env only; connection test is client-side)
    if (results.services.supabase.configured) {
      results.services.supabase.status = "healthy";
    } else {
      results.services.supabase.status = "missing";
    }

    // 4. Stripe configured
    if (results.services.stripe.configured) {
      results.services.stripe.status = "healthy";
    }

    const { backend, supabase, stripe } = results.services;
    const allOk =
      backend.status === "healthy" &&
      supabase.status !== "missing" &&
      (stripe.status === "healthy" || stripe.status === "missing"); // stripe optional

    if (backend.status !== "healthy") {
      results.status = "degraded";
    }
    if (!allOk && backend.status !== "healthy") {
      results.status = "degraded";
    }
    if (supabase.status === "missing") {
      results.status = results.status === "healthy" ? "degraded" : results.status;
    }

    return NextResponse.json(results);
  } catch (error) {
    results.status = "error";
    results.error = error instanceof Error ? error.message : String(error);
    return NextResponse.json(results, { status: 500 });
  }
}
