"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignupSelectorPage() {
  const router = useRouter();

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <div className="mb-14">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[#00f0ff]/20 bg-[#00f0ff]/5 mb-6">
          <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#00f0ff]">Onboarding Sequence</span>
        </div>
        <h1 className="font-display text-5xl font-black text-white tracking-tighter mb-4 leading-none">Initialize <br/> Account.</h1>
        <p className="text-white/40 font-medium text-lg">Select your origin vector to begin generation.</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => router.push("/signup/candidate")}
          className="w-full text-left p-8 rounded-3xl border border-white/10 bg-black/60 backdrop-blur-3xl group overflow-hidden relative shadow-2xl hover:border-[#00f0ff]/50 transition-all duration-500"
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 bg-[#00f0ff]/20 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
              <div>
                <h3 className="font-display text-3xl font-bold text-white mb-2 tracking-tight group-hover:text-[#00f0ff] transition-colors">Candidate</h3>
                <p className="text-white/40 text-sm font-medium">Upload resume. Get matched instantly.</p>
              </div>
              <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center bg-white/5 group-hover:bg-[#00f0ff] group-hover:text-black transition-colors rotate-45 group-hover:rotate-0 duration-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
              </div>
          </div>
        </button>

        <button
          onClick={() => router.push("/signup/employer")}
          className="w-full text-left p-8 rounded-3xl border border-white/10 bg-black/60 backdrop-blur-3xl group overflow-hidden relative shadow-2xl hover:border-[#7a00ff]/50 transition-all duration-500"
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 bg-[#7a00ff]/20 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
              <div>
                <h3 className="font-display text-3xl font-bold text-white mb-2 tracking-tight group-hover:text-[#7a00ff] transition-colors">Employer</h3>
                <p className="text-white/40 text-sm font-medium">Post jobs. Discover perfect tensor matches.</p>
              </div>
              <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center bg-white/5 group-hover:bg-[#7a00ff] group-hover:text-white transition-colors rotate-45 group-hover:rotate-0 duration-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
              </div>
          </div>
        </button>
      </div>

      <div className="mt-16 flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <p className="text-white/30 text-sm font-bold uppercase tracking-widest">
          Already Registered?
        </p>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
      
      <div className="mt-8 text-center">
        <Link href="/login" className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/20 text-white font-bold hover:bg-white hover:text-black transition-all duration-300">
          Authenticate Origin System
        </Link>
      </div>
    </motion.div>
  );
}
