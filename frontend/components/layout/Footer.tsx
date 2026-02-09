import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="text-white font-bold text-lg mb-4">Recruiter<span className="text-teal-400">.Solutions</span></p>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              AI-powered recruiting that connects the right talent with the right opportunities. Indeed on steroids.
            </p>
          </div>
          <div>
            <p className="text-white font-semibold mb-4">For Candidates</p>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><Link href="/jobs" className="hover:text-teal-400 transition-colors">Browse Jobs</Link></li>
              <li><Link href="/signup/candidate" className="hover:text-teal-400 transition-colors">Create Account</Link></li>
              <li><Link href="/login" className="hover:text-teal-400 transition-colors">Log in</Link></li>
              <li><Link href="/dashboard/candidate" className="hover:text-teal-400 transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-4">For Employers</p>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><Link href="/signup/employer" className="hover:text-teal-400 transition-colors">Post a Job</Link></li>
              <li><Link href="/login" className="hover:text-teal-400 transition-colors">Log in</Link></li>
              <li><Link href="/dashboard/employer" className="hover:text-teal-400 transition-colors">Dashboard</Link></li>
              <li><Link href="/dashboard/employer/market" className="hover:text-teal-400 transition-colors">Market Data</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-4">Resources</p>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><Link href="/how-it-works" className="hover:text-teal-400 transition-colors">How it works</Link></li>
              <li><Link href="/pricing" className="hover:text-teal-400 transition-colors">Pricing</Link></li>
              <li><Link href="/about" className="hover:text-teal-400 transition-colors">About</Link></li>
              <li><Link href="/faq" className="hover:text-teal-400 transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-teal-400 transition-colors">Contact</Link></li>
              <li><Link href="/terms" className="hover:text-teal-400 transition-colors">Terms</Link></li>
              <li><Link href="/privacy" className="hover:text-teal-400 transition-colors">Privacy</Link></li>
              <li><Link href="/ai-disclosure" className="hover:text-teal-400 transition-colors">AI disclosure</Link></li>
              <li><Link href="/status" className="hover:text-teal-400 transition-colors">Status</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} Recruiter.Solutions. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-zinc-500">
            <span>AI-Powered</span>
            <span>Bias-Mitigated</span>
            <span>Built for Scale</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
