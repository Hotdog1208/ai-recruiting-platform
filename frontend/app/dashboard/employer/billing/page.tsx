"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function EmployerBillingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-zinc-400 text-sm mt-1">Your plan and usage.</p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Current plan</h2>
        <p className="text-teal-400 font-medium">Free (beta)</p>
        <p className="text-zinc-400 text-sm mt-2">
          Free during beta. No credit card required. We&apos;ll notify you before any paid plans launch.
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Usage</h2>
        <p className="text-zinc-400 text-sm">
          Job postings and applicant views are unlimited on the free plan. Usage limits for paid tiers will be listed here when available.
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Upgrade</h2>
        <p className="text-zinc-400 text-sm mb-4">
          Paid plans with more jobs, analytics, and support are coming soon.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center px-4 py-2 bg-teal-500 text-black font-medium rounded-lg hover:bg-teal-400 transition-colors text-sm"
        >
          View pricing
        </Link>
      </Card>
    </div>
  );
}
