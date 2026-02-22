"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { TiltCard } from "@/components/ui/TiltCard";

export default function SignupSelectorPage() {
  const router = useRouter();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-extrabold text-white mb-3 tracking-tighter">Initialize Account.</h1>
        <p className="text-gray-400 font-medium">Select your origin vector to begin generation.</p>
      </div>

      <div className="space-y-6">
        <TiltCard maxTilt={5}>
          <button
            onClick={() => router.push("/signup/candidate")}
            className="w-full text-left card-interactive p-8 border-white/5 bg-gradient-to-br from-black/60 to-[var(--accent-primary)]/5 backdrop-blur-xl group overflow-hidden relative"
          >
            {/* Hover Glow */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 bg-[var(--accent-primary)]/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="flex items-center justify-between relative z-10">
               <div>
                  <h3 className="font-display text-2xl font-bold text-white mb-1 tracking-tight">Candidate</h3>
                  <p className="text-gray-400 text-sm font-medium">Upload resume. Get matched Instantly.</p>
               </div>
               <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-black/50 group-hover:border-[var(--accent-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
               </div>
            </div>
          </button>
        </TiltCard>

        <TiltCard maxTilt={5}>
          <button
            onClick={() => router.push("/signup/employer")}
            className="w-full text-left card-interactive p-8 border-white/5 bg-gradient-to-br from-black/60 to-[var(--accent-secondary)]/5 backdrop-blur-xl group overflow-hidden relative"
          >
            {/* Hover Glow */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 bg-[var(--accent-secondary)]/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="flex items-center justify-between relative z-10">
               <div>
                  <h3 className="font-display text-2xl font-bold text-white mb-1 tracking-tight">Employer</h3>
                  <p className="text-gray-400 text-sm font-medium">Post jobs. Discover perfect tensor matches.</p>
               </div>
               <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-black/50 group-hover:border-[var(--accent-secondary)] group-hover:text-[var(--accent-secondary)] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
               </div>
            </div>
          </button>
        </TiltCard>
      </div>

      <p className="mt-12 text-center text-gray-500 text-sm font-medium">
        Already registered?{" "}
        <Link href="/login" className="text-white hover:text-[var(--accent-primary)] font-bold transition-colors">
          Authenticate Origin
        </Link>
      </p>
    </motion.div>
  );
}
