import Link from "next/link";

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-4">Cookie policy</h1>
      <p className="text-zinc-500 text-sm mb-12">Last updated: February 2025</p>

      <div className="prose prose-invert prose-zinc max-w-none space-y-8 text-zinc-400 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-white">What we use cookies for</h2>
          <p>We use cookies and similar technologies to keep you logged in, remember preferences, and improve the service. We do not sell cookie data to third parties.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">Essential cookies</h2>
          <p>Required for authentication and security (e.g. session, CSRF). These cannot be disabled if you use the site.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">Preferences &amp; analytics</h2>
          <p>We may use cookies to remember theme or language and to understand how the site is used (e.g. page views). You can control non-essential cookies via your browser or our cookie banner when available.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">Your choices</h2>
          <p>You can block or delete cookies in your browser. Blocking essential cookies may prevent you from logging in or using certain features.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">Contact</h2>
          <p>Questions? See our <Link href="/privacy" className="text-teal-400 hover:text-teal-300">Privacy Policy</Link> or <Link href="/contact" className="text-teal-400 hover:text-teal-300">contact us</Link>.</p>
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
