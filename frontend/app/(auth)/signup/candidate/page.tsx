"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { apiPost } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function CandidateSignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!supabase) {
      setError("Auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local");
      return;
    }
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      if (!data.user) {
        setError("No user returned from signup");
        setLoading(false);
        return;
      }
      await apiPost("/auth/post-signup", {
        supabase_user_id: data.user.id,
        email: data.user.email,
        role: "candidate",
        full_name: fullName.trim(),
      });
      await supabase.auth.updateUser({ data: { role: "candidate" } });
      router.push("/dashboard/candidate");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="card-sharp border-[var(--border)] bg-[var(--bg-card)] p-8">
        <h1 className="font-display text-display-sm text-[1.5rem] text-white mb-1 tracking-tight">Candidate Signup</h1>
        <p className="text-[var(--text-muted)] text-[15px] mb-8">Create your profile to get matched with jobs.</p>

        <form onSubmit={handleSignup} className="space-y-5">
          <Input label="Full name" placeholder="Jane Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input label="Email" type="email" placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

          {error ? <div className="p-3 bg-red-500/20 text-red-400 rounded-[var(--radius-md)] text-[13px]">{error}</div> : null}

          <Button type="submit" className="w-full" size="lg" isLoading={loading} disabled={loading}>
            Sign up
          </Button>
        </form>

        <p className="mt-6 text-center text-[var(--text-muted)] text-[13px]">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-semibold link-underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
