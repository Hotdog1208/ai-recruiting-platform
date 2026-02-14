import Link from "next/link";

export default function AcceptableUsePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-4">Acceptable use policy</h1>
      <p className="text-zinc-500 text-sm mb-12">Last updated: February 2025</p>

      <div className="prose prose-invert prose-zinc max-w-none space-y-8 text-zinc-400 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-white">Prohibited conduct</h2>
          <p>You may not use Recruiter.Solutions to: post false or misleading job or candidate information; discriminate on the basis of race, color, religion, sex, national origin, age, disability, or other protected characteristics; harass, threaten, or abuse others; violate laws or third-party rights; scrape or automate access beyond normal use without permission; or attempt to circumvent security or access controls.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">Jobs &amp; applications</h2>
          <p>Job postings must be genuine and accurately describe the role and employer. Applications must reflect the candidate&apos;s own qualifications. We may remove content or suspend accounts that violate these standards.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">Enforcement</h2>
          <p>We reserve the right to suspend or terminate accounts that violate this policy. Repeated or serious violations may result in permanent bans. We may report illegal activity to authorities.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">Reporting</h2>
          <p>To report a violation, <Link href="/contact" className="text-teal-400 hover:text-teal-300">contact us</Link>. We will review and take action as appropriate.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">Contact</h2>
          <p>Questions? <Link href="/contact" className="text-teal-400 hover:text-teal-300">Contact us</Link> or see our <Link href="/terms" className="text-teal-400 hover:text-teal-300">Terms of Service</Link>.</p>
        </section>
      </div>

      <div className="mt-12">
        <Link href="/" className="text-teal-400 hover:text-teal-300 font-medium text-sm">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
