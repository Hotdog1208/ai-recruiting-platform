"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
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
      const { data, signInError } = await supabase.auth.signInWithPassword({ email, password });
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
         {/* Premium Loading Pulse */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-[var(--accent-primary)] animate-spin" />
          <div className="absolute inset-2 rounded-full border-r-2 border-[var(--accent-secondary)] animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <div className="card-interactive p-10 border-white/5 bg-black/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        {/* Subtle top glare */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <h1 className="font-display text-4xl font-extrabold text-white mb-2 tracking-tighter">Welcome back.</h1>
        <p className="text-gray-400 text-sm mb-10 font-medium">Log in to enter the AI Recruiting Engine.</p>

        {resetSuccess && (
          <div className="p-4 bg-[var(--success)]/10 text-[var(--success-light)] rounded-xl text-sm mb-6 border border-[var(--success)]/20 font-bold">
            Password updated successfully. You can now log in.
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-6">
          <Input 
            label="SECURE EMAIL" 
            type="email" 
            placeholder="identity@origin.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className="bg-black/50 border-white/5"
          />
          
          <div className="space-y-2">
            <Input 
              label="ACCESS TOKEN" 
              type="password" 
              placeholder="••••••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="bg-black/50 border-white/5"
            />
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-[11px] font-bold tracking-widest uppercase text-[var(--accent-primary)] hover:text-white transition-colors">
                Recover Access
              </Link>
            </div>
          </div>

          {error && <div className="p-4 bg-red-500/10 text-red-500 rounded-xl text-sm font-bold border border-red-500/20">{error}</div>}

          <Button type="submit" className="w-full mt-4" size="lg" isLoading={submitting}>
            Authenticate Origin
          </Button>
        </form>

        <p className="mt-8 text-center text-gray-500 text-sm font-medium">
          New to the platform?{" "}
          <Link href="/signup" className="text-white hover:text-[var(--accent-primary)] font-bold transition-colors">
            Initialize Account
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-[var(--accent-primary)] animate-spin" />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
