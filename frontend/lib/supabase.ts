import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

/** Supabase client. Null if env vars are missing (app still loads; auth will be disabled). */
export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        db: { schema: "public" },
        global: {
          headers: { "x-application-name": "recruiter-solutions" },
        },
      })
    : null;

/** Test Supabase connection (e.g. auth/getUser). Resolves to false if client is null or request fails. */
export async function testSupabaseConnection(): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      console.warn("Supabase connection check failed:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Supabase connection error:", e);
    return false;
  }
}
