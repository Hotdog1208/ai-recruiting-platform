import Link from "next/link";
import { AuthVisual } from "@/components/auth/AuthVisual";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      {/* Left side: Form content */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10 w-full lg:max-w-[45vw]">
        <header className="px-8 lg:px-12 py-8 w-full flex justify-between items-center z-20 absolute top-0 left-0">
          <Link href="/" className="font-display font-black text-2xl text-white tracking-tighter hover:text-[var(--accent-primary)] transition-colors">
            Recruiter<span className="text-[var(--accent-primary)]">.</span>
          </Link>
          <Link href="/" className="text-[11px] font-bold tracking-[0.2em] uppercase text-gray-500 hover:text-white transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center p-8 lg:p-12 xl:p-20 mt-16 lg:mt-0">
          <div className="w-full max-w-[440px]">
            {children}
          </div>
        </main>
      </div>

      {/* Right side: Stunning Visual */}
      <div className="hidden lg:flex flex-1 relative bg-black border-l border-white/5 overflow-hidden items-center justify-center">
         <AuthVisual />
      </div>
    </div>
  );
}
