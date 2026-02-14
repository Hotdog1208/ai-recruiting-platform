import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="pricing-section max-w-4xl mx-auto px-4 sm:px-6 py-20">
      <div className="section-header text-left mb-16">
        <h1 className="section-title text-4xl font-bold text-white mb-4">
          Pricing
        </h1>
        <p className="section-subtitle text-[var(--text-muted)] text-lg max-w-xl">
          Simple, transparent pricing. Free during beta.
        </p>
      </div>

      <div className="pricing-grid grid md:grid-cols-2 gap-8">
        <div className="pricing-card p-8 rounded-2xl relative overflow-hidden border-[var(--accent)]/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-dim)] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="pricing-header">
            <p className="pricing-label">Candidates</p>
            <p className="pricing-title text-white">Free</p>
            <p className="pricing-subtitle text-[var(--text-muted)]">
              Always free for job seekers.
            </p>
          </div>
          <div className="pricing-features">
            <ul>
              <li>Resume upload & AI parsing</li>
              <li>Job matching & recommended roles</li>
              <li>Saved jobs & application tracking</li>
              <li>Apply to platform & external jobs</li>
            </ul>
          </div>
          <Link
            href="/signup/candidate"
            className="pricing-cta btn-primary block w-full py-3 rounded-xl text-center"
          >
            Start free
          </Link>
        </div>
        <div className="pricing-card p-8 rounded-2xl">
          <div className="pricing-header">
            <p className="pricing-label">Employers</p>
            <p className="pricing-title text-white">Free (beta)</p>
            <p className="pricing-subtitle text-[var(--text-muted)]">
              Free during our beta. Pricing coming soon.
            </p>
          </div>
          <div className="pricing-features">
            <ul>
              <li>Unlimited job postings</li>
              <li>AI-matched candidates</li>
              <li>Applicant pipeline & shortlist</li>
              <li>Market data & insights</li>
            </ul>
          </div>
          <Link
            href="/signup/employer"
            className="pricing-cta btn-ghost block w-full py-3 rounded-xl text-center border border-[var(--border)]"
          >
            Start free
          </Link>
        </div>
      </div>

      <p className="mt-12 text-center text-[var(--text-dim)] text-sm">
        No credit card required. Cancel anytime.
      </p>
    </div>
  );
}
