import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-4">Help &amp; documentation</h1>
      <p className="text-zinc-400 text-lg mb-12">
        Quick guides to get the most out of Recruiter.Solutions.
      </p>

      <div className="space-y-6">
        <section className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Getting started</h2>
          <p className="text-zinc-400 text-sm mb-4">
            Create an account as a candidate or employer, complete your profile, and start browsing or posting jobs.
          </p>
          <Link href="/signup" className="text-teal-400 hover:text-teal-300 font-medium text-sm">
            Create account →
          </Link>
        </section>
        <section className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Candidates: resume &amp; applications</h2>
          <p className="text-zinc-400 text-sm mb-4">
            Upload a PDF or DOCX resume. We parse it with AI and populate your profile. Track applications from your dashboard.
          </p>
          <Link href="/faq" className="text-teal-400 hover:text-teal-300 font-medium text-sm">
            FAQ →
          </Link>
        </section>
        <section className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Employers: jobs &amp; applicants</h2>
          <p className="text-zinc-400 text-sm mb-4">
            Post jobs from your dashboard. View applicants, match scores, and move candidates through your pipeline.
          </p>
          <Link href="/pricing" className="text-teal-400 hover:text-teal-300 font-medium text-sm">
            Pricing →
          </Link>
        </section>
        <section className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
          <h2 className="text-lg font-semibold text-white mb-2">AI &amp; matching</h2>
          <p className="text-zinc-400 text-sm mb-4">
            How match scores work, bias mitigation, and human-in-the-loop. We never use protected attributes in matching.
          </p>
          <Link href="/ai-disclosure" className="text-teal-400 hover:text-teal-300 font-medium text-sm">
            AI disclosure →
          </Link>
        </section>
      </div>

      <div className="mt-12">
        <Link href="/contact" className="text-teal-400 hover:text-teal-300 font-medium text-sm">
          Contact support →
        </Link>
      </div>
    </div>
  );
}
