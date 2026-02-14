"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";
  const { user, role, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user && role) {
      router.replace(role === "employer" ? "/dashboard/employer" : "/dashboard/candidate");
    }
  }, [user, role, loading, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!supabase) {
      setError("Auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        setSubmitting(false);
        return;
      }
      const r = data.user?.user_metadata?.role as "candidate" | "employer" | undefined;
      router.push(r === "employer" ? "/dashboard/employer" : "/dashboard/candidate");
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || (user && role)) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="card-sharp p-8 border-[var(--border)] bg-[var(--bg-card)]">
        <h1 className="font-display text-display-sm text-[1.5rem] text-white mb-1 tracking-tight">Welcome back</h1>
        <p className="text-[var(--text-muted)] text-[15px] mb-8">Log in to continue to Recruiter.Solutions</p>

        {resetSuccess && (
          <div className="p-3 bg-[var(--accent-dim)] text-[var(--accent)] rounded-[var(--radius-md)] text-[13px] mb-5 border border-[var(--accent)]/20">
            Password updated successfully. You can now log in.
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-5">
          <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium link-underline">
              Forgot password?
            </Link>
          </div>

          {error && <div className="p-3 bg-red-500/20 text-red-400 rounded-[var(--radius-md)] text-[13px]">{error}</div>}

          <Button type="submit" className="w-full" size="lg" isLoading={submitting} disabled={submitting}>
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-[var(--text-muted)] text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium link-underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
