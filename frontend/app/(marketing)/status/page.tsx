import Link from "next/link";

export default function StatusPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20">
      <h1 className="text-4xl font-bold text-white mb-4">System status</h1>
      <p className="text-zinc-400 mb-12">
        Service health and availability.
      </p>

      <div className="space-y-4">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <div>
            <p className="font-medium text-white">Platform</p>
            <p className="text-sm text-zinc-500">Core services</p>
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-teal-500/20 text-teal-400">
            Operational
          </span>
        </div>
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <div>
            <p className="font-medium text-white">Job aggregation</p>
            <p className="text-sm text-zinc-500">JSearch, Adzuna</p>
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-teal-500/20 text-teal-400">
            Operational
          </span>
        </div>
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <div>
            <p className="font-medium text-white">AI matching</p>
            <p className="text-sm text-zinc-500">Resume parsing, match scores</p>
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-teal-500/20 text-teal-400">
            Operational
          </span>
        </div>
      </div>

      <p className="mt-12 text-center text-zinc-500 text-sm">
        Detailed status page coming soon.
      </p>

      <div className="mt-8">
        <Link href="/" className="text-teal-400 hover:text-teal-300 font-medium text-sm">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
