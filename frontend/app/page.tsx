"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/jobs?q=${encodeURIComponent(search.trim())}`);
    } else {
      router.push("/jobs");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      <Navbar />

      <main className="flex-1">
        {/* Hero - more dramatic */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(20,184,166,0.15),transparent)]" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-600/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2MmgxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-32 sm:py-44">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-teal-400 font-semibold text-sm uppercase tracking-widest mb-6">
                AI-powered recruiting
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05]">
                Find your next{" "}
                <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  career
                </span>
                <br />
                in seconds
              </h1>
              <p className="mt-8 text-lg sm:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
                Upload your resume. Get matched to roles that fit. Employers get pre-filtered, high-quality applicants. Indeed on steroids.
              </p>

              {/* Search bar - elevated */}
              <form onSubmit={handleSearch} className="mt-12 max-w-2xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white/[0.03] rounded-2xl border border-white/10 shadow-2xl shadow-black/50">
                  <input
                    type="text"
                    placeholder="Job title, keywords, or company"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-6 py-4 bg-white/5 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 border border-transparent focus:border-teal-500/30 transition-all"
                  />
                  <button
                    type="submit"
                    className="px-10 py-4 bg-teal-500 text-black font-semibold rounded-xl hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/25"
                  >
                    Search
                  </button>
                </div>
              </form>

              <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup/candidate"
                  className="inline-flex items-center justify-center px-8 py-4 bg-teal-500 text-black font-semibold rounded-xl hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/25"
                >
                  I&apos;m a Candidate
                </Link>
                <Link
                  href="/signup/employer"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-teal-500/50 text-teal-400 font-semibold rounded-xl hover:bg-teal-500/10 transition-all"
                >
                  I&apos;m an Employer
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats - improved */}
        <section className="border-y border-white/5 bg-white/[0.01]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              <div className="text-center group">
                <p className="text-4xl font-bold text-teal-400 group-hover:scale-110 transition-transform">AI</p>
                <p className="text-zinc-500 text-sm mt-2">Smart matching</p>
              </div>
              <div className="text-center group">
                <p className="text-4xl font-bold text-teal-400 group-hover:scale-110 transition-transform">0%</p>
                <p className="text-zinc-500 text-sm mt-2">Bias in filtering</p>
              </div>
              <div className="text-center group">
                <p className="text-4xl font-bold text-teal-400 group-hover:scale-110 transition-transform">1-Click</p>
                <p className="text-zinc-500 text-sm mt-2">Resume parsing</p>
              </div>
              <div className="text-center group">
                <p className="text-4xl font-bold text-teal-400 group-hover:scale-110 transition-transform">∞</p>
                <p className="text-zinc-500 text-sm mt-2">Job sources</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features - cards with more depth */}
        <section className="py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
              Indeed on steroids
            </h2>
            <p className="text-zinc-400 text-center max-w-2xl mx-auto mb-20">
              Recruiter.Solutions combines job aggregation, AI resume parsing, and smart matching in one platform.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group p-10 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/5 hover:border-teal-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/5">
                <div className="w-14 h-14 bg-teal-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-500/30 transition-colors">
                  <svg className="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Upload & parse</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Drop your resume. AI extracts skills, experience, and job fit in seconds. No forms to fill.
                </p>
              </div>
              <div className="group p-10 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/5 hover:border-teal-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/5">
                <div className="w-14 h-14 bg-teal-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-500/30 transition-colors">
                  <svg className="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">AI match score</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Every job gets a fit score and explanation. See why you match before you apply. &quot;Suggested for you&quot; roles.
                </p>
              </div>
              <div className="group p-10 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/5 hover:border-teal-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/5">
                <div className="w-14 h-14 bg-teal-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-500/30 transition-colors">
                  <svg className="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">One search, many sources</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Platform jobs + LinkedIn, Indeed, Glassdoor, ZipRecruiter. Browse or get AI recommendations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-28 border-t border-white/5">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to find your fit?</h2>
            <p className="text-zinc-400 mb-10 text-lg">
              Create a free account. Upload your resume. Get matched.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-10 py-4 bg-teal-500 text-black font-semibold rounded-xl hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/25"
              >
                Create free account
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center px-10 py-4 border-2 border-white/10 text-zinc-300 font-semibold rounded-xl hover:bg-white/5 hover:text-white transition-all"
              >
                Browse jobs
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
