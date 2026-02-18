"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { apiPost } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function EmployerSignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [checkEmail, setCheckEmail] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCheckEmail(false);
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
        role: "employer",
        company_name: companyName.trim(),
        industry: industry.trim() || undefined,
      });
      if (data.session) {
        await supabase.auth.updateUser({ data: { role: "employer" } });
        router.push("/dashboard/employer");
      } else {
        setCheckEmail(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  if (checkEmail) {
    return (
      <div className="w-full max-w-md">
        <div className="card-sharp border-[var(--border)] bg-[var(--bg-card)] p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-teal-500/20 flex items-center justify-center">
            <svg className="w-7 h-7 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="font-display text-display-sm text-[1.5rem] text-white mb-2 tracking-tight">Check your email</h1>
          <p className="text-[var(--text-muted)] text-[15px] mb-6">
            We sent a confirmation link to <span className="text-white font-medium">{email}</span>. Click it to activate your account, then sign in.
          </p>
          <Link href="/login" className="inline-block w-full py-3 bg-teal-500 text-black font-semibold rounded-xl hover:bg-teal-400 transition-colors">
            Go to sign in
          </Link>
          <p className="mt-6 text-[var(--text-muted)] text-[13px]">
            Didn&apos;t get it? Check spam, or{" "}
            <button type="button" onClick={() => setCheckEmail(false)} className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium">
              try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="card-sharp border-[var(--border)] bg-[var(--bg-card)] p-8">
        <h1 className="font-display text-display-sm text-[1.5rem] text-white mb-1 tracking-tight">Employer Signup</h1>
        <p className="text-[var(--text-muted)] text-[15px] mb-8">Post jobs and find qualified candidates.</p>

        <form onSubmit={handleSignup} className="space-y-5">
          <Input label="Company name" placeholder="Acme Inc" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
          <Input label="Industry (optional)" placeholder="Technology, Healthcare, etc." value={industry} onChange={(e) => setIndustry(e.target.value)} />
          <Input label="Email" type="email" placeholder="hr@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
