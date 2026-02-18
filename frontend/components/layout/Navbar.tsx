"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header
      className={`navbar ${scrolled ? "scrolled" : ""}`}
    >
      <div className="navbar-container">
        <Link
          href="/"
          className="navbar-logo font-display font-bold text-[17px] text-white tracking-tight hover:text-[var(--accent-primary)] transition-colors duration-200 shrink-0"
        >
          Recruiter<span className="text-[var(--accent-primary)]">.</span>Solutions
        </Link>
        <div className="navbar-menu flex items-center gap-0.5 sm:gap-1">
        <Link href="/jobs" className="nav-link px-4 py-2 text-[15px] text-[var(--text-secondary)] hover:text-white transition-colors duration-200 font-medium">
          Jobs
        </Link>
        <Link href="/how-it-works" className="hidden sm:block nav-link px-4 py-2 text-[15px] text-[var(--text-secondary)] hover:text-white transition-colors duration-200 font-medium">
          How it works
        </Link>
        <Link href="/pricing" className="hidden sm:block nav-link px-4 py-2 text-[15px] text-[var(--text-secondary)] hover:text-white transition-colors duration-200 font-medium">
          Pricing
        </Link>
        {user ? (
          <>
            <Link
              href="/dashboard"
              className="nav-link px-4 py-2 text-[15px] text-[var(--text-secondary)] hover:text-white transition-colors duration-200 font-medium"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-4 py-2 text-[15px] text-[var(--text-secondary)] hover:text-white transition-colors duration-200 font-medium"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="nav-link px-4 py-2 text-[15px] text-[var(--text-secondary)] hover:text-white transition-colors duration-200 font-medium">
              Log in
            </Link>
            <Link href="/signup" className="btn-primary btn-magnetic text-[15px] font-semibold py-2.5 px-6 sm:ml-2">
              Sign up
            </Link>
          </>
        )}
        </div>
      </div>
    </header>
  );
}
