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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
      await supabase.auth.updateUser({ data: { role: "employer" } });
      router.push("/dashboard/employer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-8">
        <h1 className="text-2xl font-bold text-white mb-1">Employer Signup</h1>
        <p className="text-zinc-400 mb-8">Post jobs and find qualified candidates.</p>

        <form onSubmit={handleSignup} className="space-y-5">
          <Input label="Company name" placeholder="Acme Inc" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
          <Input label="Industry (optional)" placeholder="Technology, Healthcare, etc." value={industry} onChange={(e) => setIndustry(e.target.value)} />
          <Input label="Email" type="email" placeholder="hr@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

          {error ? <div className="p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">{error}</div> : null}

          <Button type="submit" className="w-full" size="lg" isLoading={loading} disabled={loading}>
            Sign up
          </Button>
        </form>

        <p className="mt-6 text-center text-zinc-400 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-teal-400 hover:text-teal-300 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
