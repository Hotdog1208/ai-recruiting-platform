import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-4">How it works</h1>
      <p className="text-zinc-400 text-lg mb-16">
        AI-powered matching connects the right talent with the right opportunities. Here&apos;s the flow for both sides.
      </p>

      <div className="space-y-20">
        <section>
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-mono text-sm">1</span>
            For candidates
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-teal-500/20 transition-colors">
              <p className="text-teal-400 font-semibold mb-2">Sign up & upload</p>
              <p className="text-zinc-400 text-sm">Create an account and upload your resume. AI parses skills, experience, and job fit in seconds.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-teal-500/20 transition-colors">
              <p className="text-teal-400 font-semibold mb-2">Get matched</p>
              <p className="text-zinc-400 text-sm">We match you to platform jobs and aggregated listings (LinkedIn, Indeed, Glassdoor). See fit scores and &quot;Suggested for you&quot; roles.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-teal-500/20 transition-colors">
              <p className="text-teal-400 font-semibold mb-2">Apply & track</p>
              <p className="text-zinc-400 text-sm">Apply in-platform or follow links to employer sites. Track applications in your dashboard.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-mono text-sm">2</span>
            For employers
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-teal-500/20 transition-colors">
              <p className="text-teal-400 font-semibold mb-2">Create account</p>
              <p className="text-zinc-400 text-sm">Sign up as an employer, add your company profile, and verify your business.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-teal-500/20 transition-colors">
              <p className="text-teal-400 font-semibold mb-2">Post jobs</p>
              <p className="text-zinc-400 text-sm">Create job postings with title, description, location, and remote option. Add or remove jobs anytime.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-teal-500/20 transition-colors">
              <p className="text-teal-400 font-semibold mb-2">Review applicants</p>
              <p className="text-zinc-400 text-sm">AI pre-filters candidates by resume fit. View match scores, skills, and profiles. Shortlist, interview, or reject.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-mono text-sm">3</span>
            AI & match score
          </h2>
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <p className="text-zinc-400 mb-4">
              The match score (0–100) reflects how well a candidate fits a job based on skills, experience, and location. It is a <strong className="text-white">recommendation</strong>, not a hiring decision. Employers and candidates make final choices. AI assists; humans decide.
            </p>
            <Link href="/ai-disclosure" className="text-teal-400 hover:text-teal-300 font-medium text-sm">
              AI disclosure & fairness →
            </Link>
          </div>
        </section>
      </div>

      <div className="mt-20 flex justify-center">
        <Link href="/signup" className="px-8 py-4 bg-teal-500 text-black font-semibold rounded-xl hover:bg-teal-400 transition-colors">
          Get started
        </Link>
      </div>
    </div>
  );
}
