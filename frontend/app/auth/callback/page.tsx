"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"loading" | "recovery" | "redirect">("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const params = new URLSearchParams(hash.replace("#", ""));
    const type = params.get("type");

    if (type === "recovery") {
      setMode("recovery");
    } else {
      setMode("redirect");
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          router.replace("/dashboard/candidate");
        } else {
          router.replace("/");
        }
      });
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
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  if (mode === "redirect") {
    return null;
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
