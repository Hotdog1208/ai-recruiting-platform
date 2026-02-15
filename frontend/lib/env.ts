/**
 * Client-side env. Never log or expose secret values.
 * API URL defaults to http://127.0.0.1:8000 in dev so the app works without .env.local.
 * Banner only shows when Supabase is missing; missing API URL logs a console warning in dev.
 */

export type EnvStatus = "ok" | "missing_supabase";

export function getEnvStatus(): EnvStatus {
  const hasSupabase =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!hasSupabase) return "missing_supabase";
  return "ok";
}

/** Single source of truth for backend API base URL. */
export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
}

export const env = {
  get supabaseUrl() {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  },
  get supabaseAnonKey() {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  },
  get apiUrl() {
    return getApiUrl();
  },
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
};

export const isSetupComplete = (): boolean => getEnvStatus() === "ok";

export function getSetupMessage(): string {
  if (getEnvStatus() === "missing_supabase") {
    return "Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local (see .env.local.example).";
  }
  return "";
}

/** Call once in dev to warn if API URL is not set (we default it). */
export function logDevEnvWarnings(): void {
  if (process.env.NODE_ENV !== "development") return;
  if (!process.env.NEXT_PUBLIC_API_URL?.trim()) {
    console.warn(
      "[env] NEXT_PUBLIC_API_URL not set; using default http://127.0.0.1:8000. Set it in .env.local to override."
    );
  }
}

const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

/** Validate required env vars. Throws if any are missing (call at app init if you want hard fail). */
export function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter(
    (name) => !process.env[name]?.trim()
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. See .env.local.example.`
    );
  }
}

/** Safe validation: returns true if all required vars present. Use when you don't want to throw. */
export function isEnvValid(): boolean {
  return REQUIRED_ENV_VARS.every((name) => !!process.env[name]?.trim());
}

/** Full env check for diagnostics: required + optional, and detects placeholder values. */
export function validateEnvironment(): {
  ok: boolean;
  missing: string[];
  invalid: string[];
} {
  const required: Record<string, string | undefined> = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
  const optional: Record<string, string | undefined> = {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  };
  const missing: string[] = [];
  const invalid: string[] = [];
  for (const [key, value] of Object.entries(required)) {
    if (!value?.trim()) missing.push(key);
    else if (
      value.includes("your_") ||
      value.includes("paste_") ||
      value === "xxx"
    )
      invalid.push(key);
  }
  for (const [key, value] of Object.entries(optional)) {
    if (value?.trim() && (value.includes("your_") || value.includes("paste_") || value === "xxx"))
      invalid.push(key);
  }
  return {
    ok: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
  };
}

/** Log env status in dev (masked values). Call from client or server. */
export function logEnvironmentStatus(): void {
  if (process.env.NODE_ENV !== "development") return;
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const stripe = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const api = process.env.NEXT_PUBLIC_API_URL;
  console.group("Environment configuration");
  console.log(
    "Supabase URL:",
    u ? `${u.substring(0, 30)}...` : "missing"
  );
  console.log("Supabase Key:", k ? `${k.substring(0, 20)}...` : "missing");
  console.log(
    "Stripe Publishable:",
    stripe ? `pk_...${stripe.slice(-4)}` : "missing"
  );
  console.log("API URL:", api || "default (127.0.0.1:8000)");
  console.groupEnd();
}
