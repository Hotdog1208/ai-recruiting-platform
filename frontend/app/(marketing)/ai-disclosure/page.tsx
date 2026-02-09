import Link from "next/link";

export default function AIDisclosurePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-4">AI disclosure</h1>
      <p className="text-zinc-500 text-sm mb-12">How we use AI in Recruiter.Solutions</p>

      <div className="prose prose-invert prose-zinc max-w-none space-y-8 text-zinc-400 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-white">Overview</h2>
          <p>Recruiter.Solutions uses AI to assist with resume parsing and job matching. AI provides recommendations; humans make final decisions. We do not use AI to make hiring or rejection decisions automatically.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">Resume parsing</h2>
          <p>When you upload a resume, we use OpenAI (GPT-4o-mini) to extract: name, contact, skills, experience, education, and job fit indicators. You can review and edit the extracted data. Extraction errors can occur; we encourage you to verify.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">Match score</h2>
          <p>The match score (0–100) reflects how well your profile fits a job based on skills, experience, and location. It is computed by our AI and is a <strong className="text-white">recommendation</strong>, not a hiring decision. Employers see the score but make their own assessment. Fit score ≠ hiring decision.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">Suggested for you</h2>
          <p>We may highlight jobs as &quot;Suggested for you&quot; when AI determines your skills transfer well to roles you might not have searched for. This is a recommendation to explore; you decide whether to apply.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">Bias & fairness</h2>
          <p>We do not use protected characteristics (race, gender, age, religion, etc.) in matching. Our prompts exclude these. We aim for explainable, skill-based matching. If you believe a match is unfair, contact us or use the feedback option.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">Human review</h2>
          <p>You can request a non-automated review of your profile or match. Contact <a href="mailto:support@recruiter.solutions" className="text-teal-400 hover:text-teal-300">support@recruiter.solutions</a>.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">Data & model</h2>
          <p>Resume text is sent to OpenAI for processing. We do not train OpenAI models on your data. See our <Link href="/privacy" className="text-teal-400 hover:text-teal-300">Privacy Policy</Link> for data handling.</p>
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
