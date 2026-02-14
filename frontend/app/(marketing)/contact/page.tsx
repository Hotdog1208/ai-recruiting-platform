"use client";

import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-4">Contact us</h1>
      <p className="text-zinc-400 text-lg mb-16">
        Have a question or feedback? We&apos;d love to hear from you.
      </p>

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Get in touch</h2>
          <p className="text-zinc-400 text-sm mb-6">
            For general inquiries, support, or partnership opportunities, use the form or email us directly.
          </p>
          <p className="text-zinc-400 text-sm">
            <span className="text-zinc-500">Email:</span>{" "}
            <a href="mailto:support@recruiter.solutions" className="text-teal-400 hover:text-teal-300">
              support@recruiter.solutions
            </a>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Message</label>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none"
              placeholder="Your message..."
            />
          </div>
          {submitted ? (
            <div className="p-4 rounded-xl bg-teal-500/20 text-teal-400 text-sm">
              Thanks! We&apos;ll get back to you soon. (Form is demo-only; configure an email provider for production.)
            </div>
          ) : (
            <button
              type="submit"
              className="w-full py-3 bg-teal-500 text-black font-semibold rounded-xl hover:bg-teal-400 transition-colors"
            >
              Send message
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
