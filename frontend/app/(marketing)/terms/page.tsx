import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
      <p className="text-zinc-500 text-sm mb-12">Last updated: February 2025</p>

      <div className="prose prose-invert prose-zinc max-w-none space-y-8 text-zinc-400 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-white">1. Acceptance</h2>
          <p>By using Recruiter.Solutions, you agree to these Terms. If you do not agree, do not use the service.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">2. Description of service</h2>
          <p>Recruiter.Solutions provides job aggregation, AI-powered resume parsing, and matching between candidates and employers. We aggregate jobs from third-party sources and display platform-posted jobs.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">3. User accounts</h2>
          <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your credentials. Notify us immediately of unauthorized access.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">4. Acceptable use</h2>
          <p>You may not use the service for unlawful purposes, to post false or misleading content, to discriminate, or to harass others. We reserve the right to suspend or terminate accounts that violate these terms.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">5. AI and matching</h2>
          <p>Our AI assists with resume parsing and job matching. Match scores are recommendations only; hiring decisions are made by humans. See our <Link href="/ai-disclaimer" className="text-teal-400 hover:text-teal-300">AI disclosure</Link> for details.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">6. Intellectual property</h2>
          <p>Our service, content, and branding are owned by Recruiter.Solutions. You retain ownership of your resume and profile data but grant us a license to process and display it as needed for the service.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">7. Limitation of liability</h2>
          <p>The service is provided &quot;as is.&quot; We are not liable for indirect, incidental, or consequential damages. Our total liability is limited to the amount you paid us in the past 12 months, or $100 if none.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">8. Changes</h2>
          <p>We may update these Terms. We will notify users of material changes. Continued use after changes constitutes acceptance.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">9. Contact</h2>
          <p>Questions? Contact us at <a href="mailto:legal@recruiter.solutions" className="text-teal-400 hover:text-teal-300">legal@recruiter.solutions</a>.</p>
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
