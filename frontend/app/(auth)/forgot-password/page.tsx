"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const redirectTo = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`;
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (err) {
        setError(err.message);
        setSubmitting(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-8 text-center">
          <div className="w-14 h-14 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Check your email</h1>
          <p className="text-zinc-400 mb-6">
            We&apos;ve sent a password reset link to <strong className="text-white">{email}</strong>. Click the link to set a new password.
          </p>
          <Link href="/login" className="text-teal-400 hover:text-teal-300 font-medium">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-8">
        <h1 className="text-2xl font-bold text-white mb-1">Forgot password?</h1>
        <p className="text-zinc-400 mb-8">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {error ? <div className="p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">{error}</div> : null}
          <Button type="submit" className="w-full" size="lg" isLoading={submitting} disabled={submitting}>
            Send reset link
          </Button>
        </form>

        <p className="mt-6 text-center text-zinc-400 text-sm">
          Remember your password?{" "}
          <Link href="/login" className="text-teal-400 hover:text-teal-300 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
