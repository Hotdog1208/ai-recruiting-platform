"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { apiGet } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"loading" | "recovery" | "redirect" | "success" | "error">("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const params = new URLSearchParams(hash.replace("#", ""));
    const type = params.get("type");
    const errorParam = params.get("error");
    const errorCode = params.get("error_code") || "";

    if (errorParam === "access_denied" || errorCode.includes("otp_expir")) {
      setMode("error");
      return;
    }

    if (type === "recovery") {
      setMode("recovery");
    } else {
      setMode("redirect");
      if (!supabase) {
        router.replace("/");
        return;
      }
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          setMode("success");
          try {
            const metaRole = session.user.user_metadata?.role as "employer" | "candidate" | undefined;
            let role: "employer" | "candidate" = metaRole || "candidate";
            if (!metaRole) {
              try {
                const data = await apiGet<{ role: string }>(`/users/${session.user.id}`, session.access_token);
                role = data.role === "employer" ? "employer" : "candidate";
              } catch {
                role = "candidate";
              }
            }
            const path = role === "employer" ? "/dashboard/employer" : "/dashboard/candidate";
            await new Promise((r) => setTimeout(r, 1800));
            router.replace(path);
          } catch {
            await new Promise((r) => setTimeout(r, 1200));
            router.replace("/dashboard/candidate");
          }
        } else {
          router.replace("/");
        }
      }).catch(() => router.replace("/"));
    }
  }, [router]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      if (!supabase) {
        setError("Auth is not configured");
        setSubmitting(false);
        return;
      }
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        setError(err.message);
        setSubmitting(false);
        return;
      }
      router.replace("/login?reset=success");
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="flex gap-2 mb-4">
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <p className="text-zinc-500 text-sm">Confirming your account…</p>
      </div>
    );
  }

  if (mode === "success") {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
        <header className="border-b border-white/5 bg-[#0a0a0a]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
            <Link href="/" className="text-lg font-bold text-white">
              Recruiter<span className="text-teal-400">.Solutions</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-teal-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Email confirmed</h1>
            <p className="text-zinc-400">Welcome to Recruiter.Solutions. Taking you to your dashboard…</p>
            <div className="mt-8 flex justify-center gap-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (mode === "error") {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
        <header className="border-b border-white/5 bg-[#0a0a0a]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
            <Link href="/" className="text-lg font-bold text-white">
              Recruiter<span className="text-teal-400">.Solutions</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Link expired or invalid</h1>
              <p className="text-zinc-400 mb-6">
                This confirmation link may have expired or has already been used. If you haven&apos;t confirmed yet, try signing in—we&apos;ll send a fresh link if needed. If you see localhost in the URL, update Supabase: set Site URL to https://recruiter.solutions and add Redirect URLs in Authentication.
              </p>
              <Link
                href="/login"
                className="inline-block w-full py-3 bg-teal-500 text-black font-semibold rounded-xl hover:bg-teal-400 transition-colors"
              >
                Go to sign in
              </Link>
              <p className="mt-4 text-zinc-500 text-sm">
                <Link href="/" className="text-teal-400 hover:text-teal-300">Back to home</Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (mode === "redirect") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <header className="border-b border-white/5 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="text-lg font-bold text-white">
            Recruiter<span className="text-teal-400">.Solutions</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-8">
            <h1 className="text-2xl font-bold text-white mb-1">Set new password</h1>
            <p className="text-zinc-400 mb-8">
              Enter your new password below.
            </p>

            <form onSubmit={handlePasswordReset} className="space-y-5">
              <Input
                label="New password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <Input
                label="Confirm password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />

              {error && <div className="p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}

              <Button type="submit" className="w-full" size="lg" isLoading={submitting} disabled={submitting}>
                Update password
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
