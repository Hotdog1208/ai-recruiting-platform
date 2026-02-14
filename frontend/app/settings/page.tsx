"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const router = useRouter();
  const { user, role, loading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      if (!supabase) {
        setError("Auth is not configured");
        setSaving(false);
        return;
      }
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <nav className="bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={role === "employer" ? "/dashboard/employer" : "/dashboard/candidate"} className="text-sm text-teal-400 hover:text-teal-300 font-medium">
            ← Back to dashboard
          </Link>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-white mb-8">Account settings</h1>
        <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-8 space-y-8">
          <div>
            <h2 className="font-semibold text-white mb-4">Change password</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {success ? (
                <div className="p-3 bg-teal-500/20 text-teal-400 rounded-lg text-sm">Password updated successfully.</div>
              ) : null}
              {error ? <div className="p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">{error}</div> : null}
              <Input label="New password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} />
              <Input label="Confirm new password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} />
              <Button type="submit" isLoading={saving} disabled={saving}>
                Update password
              </Button>
            </form>
          </div>
          <div>
            <h2 className="font-semibold text-white mb-2">Forgot password?</h2>
            <p className="text-zinc-400 text-sm mb-4">
              If you can&apos;t sign in, you can request a password reset email.
            </p>
            <Link href="/forgot-password" className="text-teal-400 hover:text-teal-300 font-medium text-sm">
              Send reset link →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
