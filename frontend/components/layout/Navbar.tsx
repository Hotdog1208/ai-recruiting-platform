"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > 150 && latest > previous) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setScrolled(latest > 50);
  });

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 transition-all duration-300`}
    >
      <nav 
        className={`w-full max-w-[1200px] rounded-[2rem] transition-all duration-500 flex items-center justify-between px-6 py-4 
          ${scrolled ? "bg-black/40 border border-white/10 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]" : "bg-transparent border-transparent"}`}
      >
        <Link
          href="/"
          className="font-display font-black text-xl tracking-tighter text-white hover:text-[#00f0ff] transition-colors duration-300 flex items-center gap-1"
        >
          Recruiter<span className="text-[#00f0ff]">.</span>Solutions
        </Link>

        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2 rounded-full px-6 py-2 bg-white/[0.02] border border-white/[0.05]">
          <Link href="/jobs" className="text-sm font-semibold tracking-wide text-white/50 hover:text-white transition-colors duration-300 relative group">
            Jobs
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00f0ff] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href="/how-it-works" className="text-sm font-semibold tracking-wide text-white/50 hover:text-white transition-colors duration-300 relative group">
            Platform
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00f0ff] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href="/pricing" className="text-sm font-semibold tracking-wide text-white/50 hover:text-white transition-colors duration-300 relative group">
            Pricing
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00f0ff] transition-all duration-300 group-hover:w-full" />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-bold text-white hover:text-[#00f0ff] transition-colors">
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-5 py-2.5 rounded-full text-sm font-bold border border-white/20 text-white hover:bg-white/10 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block text-sm font-bold text-white/70 hover:text-white transition-colors">
                Log in
              </Link>
              <Link href="/signup" className="relative group overflow-hidden px-6 py-2.5 rounded-full bg-white text-black font-bold text-sm">
                <span className="relative z-10 group-hover:text-black transition-colors">Sign up</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#00f0ff] to-[#7a00ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#00f0ff] to-[#7a00ff] opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </Link>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  );
}
