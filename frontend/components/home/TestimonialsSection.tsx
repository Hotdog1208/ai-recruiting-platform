"use client";

import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    quote: "Finally a platform that matches me to roles I actually want. The fit scores save so much time—no more blind applications.",
    author: "Sarah K.",
    role: "Product Designer",
    company: "TechCorp",
    rating: 5,
  },
  {
    quote: "We hired twice as fast. The AI shortlist is surprisingly accurate and the pipeline view keeps everything in one place.",
    author: "Marcus T.",
    role: "Head of Talent",
    company: "ScaleUp Inc",
    rating: 5,
  },
  {
    quote: "Upload once, get matched everywhere. Saved jobs and application tracking made my search feel manageable for the first time.",
    author: "Jasmine L.",
    role: "Software Engineer",
    company: "Former FAANG",
    rating: 5,
  },
  {
    quote: "Clean, simple, no fluff. Our team actually uses it. That says something.",
    author: "David R.",
    role: "Startup founder",
    company: "Series A",
    rating: 5,
  },
  {
    quote: "The bias-free filtering is a game-changer. We see candidates we would have missed with keyword search alone.",
    author: "Elena M.",
    role: "HR Director",
    company: "Healthcare Co",
    rating: 5,
  },
];

function StarRating({ n }: { n: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-28 px-6 sm:px-8 lg:px-12 border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-display text-[11px] uppercase tracking-[0.3em] text-[var(--accent-primary)] mb-4 font-semibold">
            Testimonials
          </p>
          <h2 className="font-display text-[clamp(2rem, 4vw, 3rem)] font-bold text-white tracking-tight mb-4" style={{ letterSpacing: "-0.03em" }}>
            What people are saying
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-[1.125rem]">
            Candidates and employers share their experience with Recruiter.Solutions.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {TESTIMONIALS.map((t, i) => (
            <motion.blockquote
              key={t.author}
              className="group relative rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]/40 p-8 backdrop-blur-sm hover:border-[var(--accent-primary)]/20 transition-all duration-300 flex flex-col"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <StarRating n={t.rating} />
              <p className="mt-6 text-[var(--text-primary)] text-[1.0625rem] leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-8 flex items-center gap-4 pt-6 border-t border-[var(--border)]">
                <span className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-primary)]/30 to-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] font-display font-bold text-lg">
                  {t.author.charAt(0)}
                </span>
                <div>
                  <p className="text-white font-semibold">{t.author}</p>
                  <p className="text-[var(--text-secondary)] text-sm">{t.role} at {t.company}</p>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
