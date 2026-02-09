"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupSelectorPage() {
  const router = useRouter();

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-1">Join Recruiter.Solutions</h1>
        <p className="text-zinc-400 mb-8">Choose how you want to use the platform.</p>

        <div className="space-y-4">
          <button
            onClick={() => router.push("/signup/candidate")}
            className="w-full py-3.5 bg-teal-500 text-black rounded-lg hover:bg-teal-400 font-semibold transition-colors"
          >
            I&apos;m a Candidate
          </button>
          <button
            onClick={() => router.push("/signup/employer")}
            className="w-full py-3.5 border-2 border-teal-500 text-teal-400 rounded-lg hover:bg-teal-500/10 font-semibold transition-colors"
          >
            I&apos;m an Employer
          </button>
        </div>

        <p className="mt-6 text-zinc-400 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-teal-400 hover:text-teal-300 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
