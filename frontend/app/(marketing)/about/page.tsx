import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-4">About us</h1>
      <p className="text-zinc-400 text-lg mb-16">
        Recruiter.Solutions is built to make hiring and job search smarter, faster, and fairer.
      </p>

      <div className="prose prose-invert prose-zinc max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Our mission</h2>
          <p className="text-zinc-400 leading-relaxed">
            We combine job aggregation from LinkedIn, Indeed, Glassdoor, and more with AI-powered resume parsing and matching. Candidates get fit scores and role suggestions they might not have considered. Employers get pre-filtered, high-quality applicants. AI assists; humans decide.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-4">What we do</h2>
          <ul className="space-y-2 text-zinc-400">
            <li>• Aggregate jobs from major platforms via JSearch and Adzuna</li>
            <li>• Parse resumes with AI to extract skills, experience, and job fit</li>
            <li>• Match candidates to jobs with explainable scores</li>
            <li>• Suggest roles based on transferable skills (&quot;Suggested for you&quot;)</li>
            <li>• Provide employers with applicant pipelines and candidate profiles</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Trust & fairness</h2>
          <p className="text-zinc-400 leading-relaxed">
            We do not use protected characteristics (race, gender, age, etc.) in matching. Match scores reflect skills, experience, and location fit. We provide transparency on how AI is used and allow users to appeal or request human review.
          </p>
          <Link href="/ai-disclosure" className="text-teal-400 hover:text-teal-300 font-medium text-sm inline-block mt-4">
            AI disclosure →
          </Link>
        </section>
      </div>

      <div className="mt-16 flex justify-center">
        <Link href="/contact" className="px-8 py-4 border border-white/10 text-zinc-300 font-semibold rounded-xl hover:bg-white/5 hover:text-white transition-colors">
          Contact us
        </Link>
      </div>
    </div>
  );
}
