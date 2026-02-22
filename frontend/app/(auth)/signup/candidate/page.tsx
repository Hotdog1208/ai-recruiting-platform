"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
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
        role: "candidate",
        full_name: fullName.trim(),
      });
      if (data.session) {
        await supabase.auth.updateUser({ data: { role: "candidate" } });
        router.push("/dashboard/candidate");
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
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        <div className="card-interactive p-10 border-white/5 bg-black/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-primary)]/50 to-transparent" />
          
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center border border-[var(--accent-primary)]/20 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
            <svg className="w-8 h-8 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-white mb-3 tracking-tighter">Transmission Sent.</h1>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed font-medium">
            We dispatched a secure linkage to <span className="text-white font-bold">{email}</span>. Click the payload to activate your tensor parameters, then authenticate.
          </p>
          <Link href="/login" className="inline-block w-full py-4 bg-[var(--accent-primary)] text-black font-extrabold rounded-full hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(0,240,255,0.3)] tracking-wide">
            PROCEED TO AUTHENTICATE
          </Link>
          <p className="mt-8 text-gray-500 text-xs font-bold tracking-widest uppercase">
            Signal lost?{" "}
            <button type="button" onClick={() => setCheckEmail(false)} className="text-white hover:text-[var(--accent-primary)] transition-colors ml-1">
              RETRANSMIT
            </button>
          </p>
        </div>
      </motion.div>
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
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <h1 className="font-display text-4xl font-extrabold text-white mb-2 tracking-tighter">Candidate Genesis.</h1>
        <p className="text-gray-400 text-sm mb-10 font-medium">Create your profile to index into the Global Vector Database.</p>

        <form onSubmit={handleSignup} className="space-y-6">
          <Input label="FULL IDENTIFIER" placeholder="Jane Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="bg-black/50 border-white/5" />
          <Input label="SECURE EMAIL" type="email" placeholder="jane@origin.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-black/50 border-white/5" />
          <Input label="ACCESS TOKEN" type="password" placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="bg-black/50 border-white/5" />

          {error ? <div className="p-4 bg-red-500/10 text-red-500 rounded-xl text-sm font-bold border border-red-500/20">{error}</div> : null}

          <Button type="submit" className="w-full mt-4" size="lg" isLoading={loading}>
            Initialize Record
          </Button>
        </form>

        <p className="mt-8 text-center text-gray-500 text-sm font-medium">
          Already registered?{" "}
          <Link href="/login" className="text-white hover:text-[var(--accent-primary)] font-bold transition-colors">
            Authenticate Origin
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
