"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/Input";

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
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-[#00f0ff] animate-spin" />
          <div className="absolute inset-2 rounded-full border-b-2 border-[#7a00ff] animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <div className="mb-14">
        <h1 className="font-display text-5xl font-black text-white tracking-tighter mb-4 leading-none">Welcome <br/> Back.</h1>
        <p className="text-white/40 font-medium text-lg">Authenticate your origin vector to proceed.</p>
      </div>

      {resetSuccess && (
        <div className="p-4 bg-[#00ff87]/10 text-[#00ff87] rounded-xl text-sm mb-8 border border-[#00ff87]/20 font-bold backdrop-blur-md">
          Vector key updated successfully. You may now authenticate.
        </div>
      )}

      <form onSubmit={handleSignIn} className="space-y-8">
        <div>
           <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 mb-3 ml-2">Secure Origin</label>
           <input
             type="email"
             placeholder="identity@origin.com"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             required
             className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#00f0ff]/50 focus:ring-1 focus:ring-[#00f0ff]/50 transition-all font-medium text-lg"
           />
        </div>
        
        <div>
           <div className="flex justify-between items-center mb-3 ml-2 mr-2">
             <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/50">Access Token</label>
             <Link href="/forgot-password" className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#00f0ff] hover:text-white transition-colors">
               Recover
             </Link>
           </div>
           <input
             type="password"
             placeholder="••••••••••••"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             required
             className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#00f0ff]/50 focus:ring-1 focus:ring-[#00f0ff]/50 transition-all font-medium text-lg tracking-widest"
           />
        </div>

        {error && <div className="p-4 bg-red-500/10 text-red-500 rounded-xl text-sm font-bold border border-red-500/20">{error}</div>}

        <button 
          type="submit" 
          disabled={submitting}
          className="w-full relative group overflow-hidden rounded-full mt-4 flex items-center justify-center"
        >
           <div className="absolute inset-0 bg-white group-hover:bg-transparent transition-colors duration-300" />
           <div className="absolute inset-0 bg-gradient-to-r from-[#00f0ff] to-[#7a00ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
           <span className="relative z-10 px-8 py-5 text-black group-hover:text-white font-bold text-lg transition-colors">
             {submitting ? "Authenticating..." : "Authenticate"}
           </span>
        </button>
      </form>

      <div className="mt-16 flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <p className="text-white/30 text-sm font-bold uppercase tracking-widest">
          No Origin Tensor?
        </p>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
      
      <div className="mt-8 text-center">
        <Link href="/signup" className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/20 text-white font-bold hover:bg-white hover:text-black transition-all duration-300">
          Initialize New Account
        </Link>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-[#00f0ff] animate-spin" />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
