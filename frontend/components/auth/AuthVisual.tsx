"use client";

import { motion } from "framer-motion";
import { TiltCard } from "../ui/TiltCard";

export function AuthVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Liquid Aurora Ambient BG */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/10 via-black to-[var(--accent-secondary)]/10"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
      />
      
      {/* Abstract Glowing Orbs */}
      <motion.div 
        className="absolute w-[800px] h-[800px] bg-[var(--accent-primary)]/20 rounded-full blur-[120px] mix-blend-screen"
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -50, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute w-[600px] h-[600px] bg-[var(--accent-secondary)]/20 rounded-full blur-[100px] mix-blend-screen"
        animate={{ scale: [1, 1.3, 1], x: [0, -60, 0], y: [0, 60, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating UI Elements */}
      <div className="relative z-10 w-full max-w-lg aspect-square">
        <TiltCard maxTilt={5}>
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute top-1/4 -right-12 card-interactive p-6 border-white/10 bg-black/40 backdrop-blur-3xl shadow-2xl w-[320px]"
          >
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#0084ff] p-[2px]">
                  <div className="w-full h-full bg-black rounded-full" />
                </div>
                <div>
                  <h3 className="text-white font-bold tracking-tight">System Match</h3>
                  <p className="text-[var(--accent-primary)] text-xs font-bold uppercase tracking-widest">99.8% Compatibility</p>
                </div>
             </div>
             <div className="space-y-2">
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                   <motion.div className="h-full bg-[var(--accent-primary)]" initial={{ width: 0 }} animate={{ width: "99.8%" }} transition={{ duration: 1.5, delay: 0.8 }} />
                </div>
                <div className="w-4/5 h-2 bg-white/10 rounded-full overflow-hidden">
                   <motion.div className="h-full bg-[var(--accent-secondary)]" initial={{ width: 0 }} animate={{ width: "85%" }} transition={{ duration: 1.5, delay: 1 }} />
                </div>
             </div>
          </motion.div>
        </TiltCard>

        <TiltCard maxTilt={8}>
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="absolute bottom-1/4 -left-12 card-interactive p-6 border-white/5 bg-black/60 backdrop-blur-3xl shadow-2xl w-[280px]"
          >
             <div className="w-10 h-10 rounded-xl bg-[var(--accent-secondary)]/20 flex items-center justify-center text-[var(--accent-secondary)] mb-4">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <h4 className="text-white font-bold mb-1">Vector Parsing Complete</h4>
             <p className="text-gray-400 text-xs">O(1) Similarity matrices generated.</p>
          </motion.div>
        </TiltCard>
      </div>

      {/* Decorative Noise */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
    </div>
  );
}
