"use client";

import { useState } from "react";
import Link from "next/link";

const FAQ_ITEMS = [
  {
    q: "How does the match score work?",
    a: "The match score (0–100) reflects how well your resume fits a job based on skills, experience, and location. It's a recommendation, not a hiring decision. Employers and candidates make final choices. See our AI disclosure for more.",
  },
  {
    q: "What does 'Suggested for you' mean?",
    a: "AI identifies roles where your skills transfer well but you might not have searched for them. These are highlighted so you can discover opportunities you might otherwise miss.",
  },
  {
    q: "Where do the jobs come from?",
    a: "Platform jobs (posted by employers) plus aggregated listings from LinkedIn, Indeed, Glassdoor, ZipRecruiter, and more via JSearch and Adzuna.",
  },
  {
    q: "Is it free?",
    a: "Yes. Candidates are free. Employers are free during our beta. We'll announce pricing before any charges.",
  },
  {
    q: "How do I apply?",
    a: "For platform jobs, click Apply and we'll submit your profile. For external jobs, you'll be redirected to the employer's site to apply there.",
  },
  {
    q: "Can employers see my full resume?",
    a: "Employers see your profile (skills, experience, location) when you apply. You control visibility in settings. We never share data without consent.",
  },
  {
    q: "How do I delete my account?",
    a: "Go to Settings → Account and use the delete option. We'll remove your data per our privacy policy.",
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-4">FAQ</h1>
      <p className="text-zinc-400 text-lg mb-16">
        Common questions from candidates and employers.
      </p>

      <div className="space-y-2">
        {FAQ_ITEMS.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full px-6 py-4 text-left flex justify-between items-center gap-4 hover:bg-white/[0.02] transition-colors"
            >
              <span className="font-medium text-white">{item.q}</span>
              <span className="text-teal-400 shrink-0">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && (
              <div className="px-6 pb-4 text-zinc-400 text-sm leading-relaxed">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <Link href="/contact" className="text-teal-400 hover:text-teal-300 font-medium">
          Still have questions? Contact us →
        </Link>
      </div>
    </div>
  );
}
