"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPut } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const COMPANY_SIZES = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501+", label: "501+ employees" },
];

const INDUSTRIES = [
  "Technology", "Healthcare", "Finance", "Education", "Retail",
  "Manufacturing", "Consulting", "Media", "Non-profit", "Other",
];

type EmployerProfile = {
  id: string;
  company_name: string;
  industry: string | null;
  website: string | null;
  company_size: string | null;
  location: string | null;
  description: string | null;
};

const selectClass = "w-full px-4 py-2.5 rounded-lg bg-zinc-900/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50";

export default function EmployerProfilePage() {
  const router = useRouter();
  const { user, role, loading, session } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !session?.access_token) return;
    apiGet<EmployerProfile>("/employers/me", session.access_token)
      .then((p) => {
        setCompanyName(p.company_name);
        setIndustry(p.industry || "");
        setWebsite(p.website || "");
        setCompanySize(p.company_size || "");
        setLocation(p.location || "");
        setDescription(p.description || "");
      })
      .catch(() => {});
  }, [user, session?.access_token]);

  useEffect(() => {
    if (role === "candidate") router.push("/profile/candidate");
  }, [role, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;
    setSaving(true);
    setSuccess(false);
    try {
      await apiPut("/employers/me", {
        company_name: companyName.trim(),
        industry: industry.trim() || null,
        website: website.trim() || null,
        company_size: companySize || null,
        location: location.trim() || null,
        description: description.trim() || null,
      }, session.access_token);
      setSuccess(true);
    } catch {
      // error
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <nav className="bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard/employer" className="text-sm text-teal-400 hover:text-teal-300 font-medium">
            ← Back to dashboard
          </Link>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-white mb-2">Edit company profile</h1>
        <p className="text-zinc-400 text-sm mb-8">Complete your company profile to attract the best candidates.</p>
        <form onSubmit={handleSubmit} className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-8 space-y-6">
          {success ? (
            <div className="p-3 bg-teal-500/20 text-teal-400 rounded-lg text-sm">Profile updated successfully.</div>
          ) : null}
          <Input label="Company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Industry</label>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={selectClass}>
              <option value="">Select industry</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
          <Input label="Website" type="url" placeholder="https://company.com" value={website} onChange={(e) => setWebsite(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Company size</label>
            <select value={companySize} onChange={(e) => setCompanySize(e.target.value)} className={selectClass}>
              <option value="">Select size</option>
              {COMPANY_SIZES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <Input label="Location" placeholder="City, State or HQ location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Company description</label>
            <textarea
              className={`${selectClass} min-h-[120px] resize-none`}
              placeholder="Brief description of your company, culture, and what you do..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button type="submit" isLoading={saving} disabled={saving}>
            Save changes
          </Button>
        </form>
      </div>
    </div>
  );
}
