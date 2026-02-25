"use client";

import Link from "next/link";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="relative bg-black border-t border-white/10 overflow-hidden text-white pt-24 pb-10">
      {/* Background glow lines */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-30" />
      <div className="absolute top-0 right-[10%] w-[300px] h-[300px] bg-[#7a00ff] blur-[150px] mix-blend-screen opacity-20" />
      
      <div className="container mx-auto px-6 max-w-[1400px]">
        {/* Massive Stats Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-white/10 pb-20 mb-20 text-center">
          <div>
            <div className="font-display text-[clamp(3rem,5vw,5rem)] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 mb-2 leading-none">
              <AnimatedCounter value={7890} suffix="+" duration={1.5} />
            </div>
            <p className="text-[#00f0ff] uppercase tracking-[0.2em] font-bold text-xs">Vector Matches Made</p>
          </div>
          <div>
            <div className="font-display text-[clamp(3rem,5vw,5rem)] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 mb-2 leading-none">
              <AnimatedCounter value={0} suffix="%" duration={1.5} />
            </div>
            <p className="text-[#00ff87] uppercase tracking-[0.2em] font-bold text-xs">Human Bias Detected</p>
          </div>
          <div>
            <div className="font-display text-[clamp(3rem,5vw,5rem)] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 mb-2 leading-none">
              O(1)
            </div>
            <p className="text-[#7a00ff] uppercase tracking-[0.2em] font-bold text-xs">Time Complexity</p>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-20">
          <div className="md:col-span-5">
            <Link href="/" className="font-display font-black text-3xl tracking-tighter mb-6 inline-block">
              Recruiter<span className="text-[#00f0ff]">.</span>Solutions
            </Link>
            <p className="text-white/50 text-lg max-w-sm leading-relaxed mb-8 font-medium">
              We mathematically guarantee the absolute optimal intersection between exceptional talent and visionary companies.
            </p>
            <div className="flex gap-4">
               {/* Social placeholders */}
               <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer">X</div>
               <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer">in</div>
               <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer">gh</div>
            </div>
          </div>

          <div className="md:col-span-2 md:col-start-7">
            <h4 className="font-bold uppercase tracking-widest text-xs text-white/40 mb-6">Candidates</h4>
            <ul className="space-y-4">
              <li><Link href="/jobs" className="text-white/80 hover:text-[#00f0ff] transition-colors font-medium">Browse Hub</Link></li>
              <li><Link href="/signup/candidate" className="text-white/80 hover:text-[#00f0ff] transition-colors font-medium">Get Evaluated</Link></li>
              <li><Link href="/login" className="text-white/80 hover:text-[#00f0ff] transition-colors font-medium">Dashboard</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-bold uppercase tracking-widest text-xs text-white/40 mb-6">Employers</h4>
            <ul className="space-y-4">
              <li><Link href="/pricing" className="text-white/80 hover:text-[#7a00ff] transition-colors font-medium">Post Roles</Link></li>
              <li><Link href="/signup/employer" className="text-white/80 hover:text-[#7a00ff] transition-colors font-medium">Create Instance</Link></li>
              <li><Link href="/pricing" className="text-white/80 hover:text-[#7a00ff] transition-colors font-medium">Platform Pricing</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-bold uppercase tracking-widest text-xs text-white/40 mb-6">Legal</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/terms" className="text-white/50 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-white/50 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/security" className="text-white/50 hover:text-white transition-colors">Security Audit</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-white/30 text-xs font-bold uppercase tracking-widest">
           <p>© {new Date().getFullYear()} Recruiter.Solutions AI.</p>
           <p className="mt-4 md:mt-0 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-[#00ff87] animate-pulse" />
             All Systems Operational
           </p>
        </div>
      </div>
    </footer>
  );
}
