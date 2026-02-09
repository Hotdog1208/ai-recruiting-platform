"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (!loading && user && role) {
      const isCandidatePage = pathname?.includes("/dashboard/candidate");
      const isEmployerPage = pathname?.includes("/dashboard/employer");
      if (isCandidatePage && role === "employer") router.push("/dashboard/employer");
      else if (isEmployerPage && role === "candidate") router.push("/dashboard/candidate");
    }
  }, [user, loading, role, pathname, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="text-lg font-bold text-white">
            Recruiter<span className="text-teal-400">.Solutions</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/jobs" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Jobs
            </Link>
            <span className="text-zinc-500 text-sm capitalize hidden sm:inline">{role}</span>
            <Link href={role === "employer" ? "/profile/employer" : "/profile/candidate"} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Profile
            </Link>
            <Link href="/settings" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Settings
            </Link>
            <Link href={role === "employer" ? "/dashboard/employer" : "/dashboard/candidate"} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            {role === "candidate" && (
              <>
                <Link href="/dashboard/candidate/applications" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                  Applications
                </Link>
                <Link href="/dashboard/candidate/saved" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                  Saved Jobs
                </Link>
              </>
            )}
            {role === "employer" && (
              <Link href="/dashboard/employer/market" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                Market
              </Link>
            )}
            <button onClick={handleSignOut} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
