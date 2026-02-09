import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-4">Pricing</h1>
      <p className="text-zinc-400 text-lg mb-16">
        Simple, transparent pricing. Free during beta.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-8 rounded-2xl bg-white/[0.02] border border-teal-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <p className="text-teal-400 font-semibold mb-2">Candidates</p>
          <p className="text-4xl font-bold text-white mb-2">Free</p>
          <p className="text-zinc-400 text-sm mb-6">Always free for job seekers.</p>
          <ul className="space-y-3 text-sm text-zinc-300">
            <li>✓ Resume upload & AI parsing</li>
            <li>✓ Job matching & recommended roles</li>
            <li>✓ Saved jobs & application tracking</li>
            <li>✓ Apply to platform & external jobs</li>
          </ul>
          <Link href="/signup/candidate" className="mt-8 block w-full py-3 bg-teal-500 text-black font-semibold rounded-xl text-center hover:bg-teal-400 transition-colors">
            Start free
          </Link>
        </div>
        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-teal-500/20 transition-colors">
          <p className="text-teal-400 font-semibold mb-2">Employers</p>
          <p className="text-4xl font-bold text-white mb-2">Free (beta)</p>
          <p className="text-zinc-400 text-sm mb-6">Free during our beta. Pricing coming soon.</p>
          <ul className="space-y-3 text-sm text-zinc-300">
            <li>✓ Unlimited job postings</li>
            <li>✓ AI-matched candidates</li>
            <li>✓ Applicant pipeline & shortlist</li>
            <li>✓ Market data & insights</li>
          </ul>
          <Link href="/signup/employer" className="mt-8 block w-full py-3 border border-teal-500/50 text-teal-400 font-semibold rounded-xl text-center hover:bg-teal-500/10 transition-colors">
            Start free
          </Link>
        </div>
      </div>

      <p className="mt-12 text-center text-zinc-500 text-sm">
        No credit card required. Cancel anytime.
      </p>
    </div>
  );
}
