import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
      <p className="text-zinc-500 text-sm mb-12">Last updated: February 2025</p>

      <div className="prose prose-invert prose-zinc max-w-none space-y-8 text-zinc-400 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-white">1. Information we collect</h2>
          <p>We collect: account information (email, password), profile data (name, location, skills, experience), resume content when you upload it, and usage data (job views, applications). We use Supabase for auth and PostgreSQL for storage.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">2. How we use it</h2>
          <p>We use your data to: provide the service (matching, job discovery), parse your resume with AI, share your profile with employers when you apply, improve our matching algorithms, and send transactional emails (verification, password reset).</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">3. AI processing</h2>
          <p>Your resume is processed by AI (OpenAI) to extract skills, experience, and job fit. We do not use protected characteristics (race, gender, age) in matching. See our <Link href="/ai-disclosure" className="text-teal-400 hover:text-teal-300">AI disclosure</Link>.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">4. Sharing</h2>
          <p>We share your profile with employers when you apply to their jobs. We do not sell your data. We may share with service providers (Supabase, OpenAI) under strict agreements.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">5. Retention</h2>
          <p>We retain your data while your account is active. You can delete your account and data at any time from Settings. Resumes may be retained in backups for a limited period.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">6. Your rights</h2>
          <p>You can: access your data, correct it, delete your account, and export your data. Contact us at <a href="mailto:privacy@recruiter.solutions" className="text-teal-400 hover:text-teal-300">privacy@recruiter.solutions</a>.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">7. Security</h2>
          <p>We use HTTPS, secure auth (Supabase), and industry-standard practices. We do not store passwords in plain text.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">8. Cookies</h2>
          <p>We use essential cookies for authentication. We may use analytics cookies; you can opt out in browser settings.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">9. Contact</h2>
          <p>Questions? <a href="mailto:privacy@recruiter.solutions" className="text-teal-400 hover:text-teal-300">privacy@recruiter.solutions</a></p>
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
