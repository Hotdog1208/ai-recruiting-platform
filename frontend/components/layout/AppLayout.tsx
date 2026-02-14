"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  Settings,
  Building2,
  CreditCard,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const candidateNav = [
  { href: "/dashboard/candidate", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/dashboard/candidate/applications", label: "Applications", icon: FileText },
  { href: "/profile/candidate", label: "Profile", icon: User },
  { href: "/dashboard/candidate/saved", label: "Saved", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

const employerNav = [
  { href: "/dashboard/employer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/dashboard/employer/market", label: "Applicants", icon: FileText },
  { href: "/profile/employer", label: "Company", icon: Building2 },
  { href: "/dashboard/employer/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (!loading && user && role) {
      const isCandidate = pathname?.startsWith("/dashboard/candidate") || pathname?.startsWith("/profile/candidate");
      const isEmployer = pathname?.startsWith("/dashboard/employer") || pathname?.startsWith("/profile/employer") || pathname?.startsWith("/jobs");
      if (isCandidate && role === "employer") router.push("/dashboard/employer");
      else if (isEmployer && role === "candidate" && pathname?.includes("/dashboard/employer")) router.push("/dashboard/candidate");
    }
  }, [user, loading, role, pathname, router]);

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    router.push("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  const nav = role === "candidate" ? candidateNav : employerNav;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      {/* Sidebar - desktop */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col lg:w-56 lg:fixed lg:inset-y-0 lg:z-40",
          "bg-[var(--bg-secondary)] border-r border-[var(--border)]"
        )}
      >
        <div className="flex h-16 items-center px-4 border-b border-[var(--border)]">
          <Link href="/" className="font-display font-semibold text-white">
            Recruiter<span className="text-[var(--accent)]">.Solutions</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/jobs" && pathname?.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar - mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-56 bg-[var(--bg-secondary)] border-r border-[var(--border)] lg:hidden",
          "transform transition-transform duration-200 ease-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-[var(--border)]">
          <Link href="/" className="font-display font-semibold text-white" onClick={() => setSidebarOpen(false)}>
            Recruiter<span className="text-[var(--accent)]">.Solutions</span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-[var(--text-muted)] hover:text-white rounded-lg"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-3 space-y-0.5">
          {nav.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/jobs" && pathname?.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-[var(--accent-dim)] text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => { setSidebarOpen(false); handleSignOut(); }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-white hover:bg-white/5"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Sign out
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:pl-56">
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center gap-4 border-b border-[var(--border)] bg-[var(--bg-primary)]/98 backdrop-blur-sm px-4 sm:px-6 shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-[var(--text-muted)] hover:text-white rounded-lg"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" />
          <span className="text-[var(--text-dim)] text-sm capitalize hidden sm:inline">{role}</span>
          <Link
            href={role === "employer" ? "/profile/employer" : "/profile/candidate"}
            className="text-sm font-medium text-[var(--text-muted)] hover:text-white transition-colors"
          >
            Profile
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="hidden lg:block text-sm font-medium text-[var(--text-muted)] hover:text-white transition-colors"
          >
            Sign out
          </button>
        </header>
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
