"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPatch, apiUpload } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { countries, getStates, getCities, WORK_PREFERENCES, WORK_TYPES } from "@/lib/location";
import { VideoPlayer } from "@/components/profile/VideoPlayer";
import { VideoRecorder } from "@/components/profile/VideoRecorder";

type CandidateProfile = {
  id: string;
  full_name: string;
  location: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  age: number | null;
  work_preference: string | null;
  work_type: string | null;
  phone: string | null;
  headline: string | null;
  summary: string | null;
  education: unknown[] | null;
  experience: unknown[] | null;
  skills: string[] | null;
  video_url?: string | null;
  resume_parsed_data?: unknown;
};

const selectClass = "w-full px-4 py-2.5 rounded-lg bg-zinc-900/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50";

export default function CandidateProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, role, loading, session } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [workPreference, setWorkPreference] = useState("");
  const [workType, setWorkType] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [resumeWarning, setResumeWarning] = useState("");
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);

  const states = country ? getStates(country) : [];
  const cities = country && state ? getCities(country, state) : [];

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !session?.access_token) return;
    apiGet<CandidateProfile>(`/candidates/by-user/${user.id}`, session.access_token)
      .then((p) => {
        setProfile(p);
        setFullName(p.full_name);
        setAge(p.age != null ? String(p.age) : "");
        setCountry(p.country || "");
        setState(p.state || "");
        setCity(p.city || "");
        setPhone(p.phone || "");
        setHeadline(p.headline || "");
        setSummary(p.summary || "");
        setWorkPreference(p.work_preference || "");
        setWorkType(p.work_type || "");
        setSkillsText(Array.isArray(p.skills) ? p.skills.join(", ") : "");
      })
      .catch(() => {});
  }, [user, session?.access_token]);

  useEffect(() => {
    if (role === "employer") router.push("/profile/employer");
  }, [role, router]);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!session?.access_token) {
      setResumeError("Please log in again to upload your resume.");
      return;
    }
    const valid = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!valid.includes(file.type) && !file.name.match(/\.(pdf|docx|doc|txt)$/i)) {
      setResumeError("Please upload PDF, DOCX, or TXT (max 10MB).");
      return;
    }
    setResumeUploading(true);
    setResumeError("");
    setResumeWarning("");
    try {
      const res = await apiUpload<{
        parsed: Record<string, unknown>;
        warnings?: string[];
        ai_used?: boolean;
      }>(`/candidates/by-user/${user.id}/resume`, file, session.access_token);
      setFullName((res.parsed?.full_name as string) || fullName);
      if (Array.isArray(res.parsed?.skills) && res.parsed.skills.length) {
        setSkillsText((res.parsed.skills as string[]).join(", "));
      }
      setSuccess(true);
      setProfile((p) => p ? { ...p, resume_parsed_data: res.parsed } : null);
      if (res.warnings?.length && !res.ai_used) {
        setResumeWarning(res.warnings[0] ?? "Basic extraction used. You can edit fields below.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setResumeError(msg.includes("401") || msg.toLowerCase().includes("invalid token") ? "Session expired. Please log in again and try again." : msg);
    } finally {
      setResumeUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !session?.access_token) return;
    setSaving(true);
    setSuccess(false);
    try {
      await apiPatch(`/candidates/by-user/${user.id}`, {
        full_name: fullName.trim(),
        age: age ? parseInt(age, 10) : null,
        city: city.trim() || null,
        state: state || null,
        country: country || null,
        phone: phone.trim() || null,
        headline: headline.trim() || null,
        summary: summary.trim() || null,
        work_preference: workPreference || null,
        work_type: workType || null,
        skills: skillsText.split(",").map((s) => s.trim()).filter(Boolean),
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
          <Link href="/dashboard/candidate" className="text-sm text-teal-400 hover:text-teal-300 font-medium">
            ← Back to dashboard
          </Link>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-white mb-2">Edit your profile</h1>
        <p className="text-zinc-400 text-sm mb-8">Complete your profile for better job matching.</p>

        <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-8 mb-8">
          <h2 className="font-semibold text-white mb-2">Upload resume (AI parsing)</h2>
          <p className="text-zinc-400 text-sm mb-4">
            Upload your resume and AI will extract your skills, experience, and job fit. PDF, DOCX, or TXT.
          </p>
          <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc,.txt" onChange={handleResumeUpload} className="hidden" />
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} isLoading={resumeUploading} disabled={resumeUploading}>
            {resumeUploading ? "Parsing..." : "Upload & parse resume"}
          </Button>
          {resumeError ? <p className="mt-2 text-sm text-red-400">{resumeError}</p> : null}
          {resumeWarning ? <p className="mt-2 text-sm text-amber-400">{resumeWarning}</p> : null}
          {profile?.resume_parsed_data ? (
            <p className="mt-2 text-sm text-teal-400">✓ Resume parsed successfully</p>
          ) : null}
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-8 mb-8">
          <h2 className="font-semibold text-white mb-2">Intro video</h2>
          <p className="text-zinc-400 text-sm mb-4">
            Record a short video (up to 60s) so employers can see your personality. WebM or MP4.
          </p>
          {showVideoRecorder ? (
            <VideoRecorder
              onUpload={async (blob) => {
                if (!session?.access_token) throw new Error("Please log in again.");
                const file = new File([blob], "intro.webm", { type: blob.type || "video/webm" });
                await apiUpload<{ video_url: string }>(`/candidates/me/video`, file, session.access_token);
                const p = await apiGet<CandidateProfile>(`/candidates/by-user/${user!.id}`, session.access_token);
                setProfile(p);
                setShowVideoRecorder(false);
              }}
              onCancel={() => setShowVideoRecorder(false)}
            />
          ) : profile?.video_url ? (
            <div>
              <VideoPlayer videoUrl={profile.video_url} />
              <Button type="button" variant="ghost" className="mt-2" onClick={() => setShowVideoRecorder(true)}>
                Replace video
              </Button>
            </div>
          ) : (
            <Button type="button" variant="outline" onClick={() => setShowVideoRecorder(true)}>
              Record intro video
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-8 space-y-6">
          {success ? (
            <div className="p-3 bg-teal-500/20 text-teal-400 rounded-lg text-sm">Profile updated successfully.</div>
          ) : null}

          <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Age</label>
            <input
              type="number"
              min={18}
              max={120}
              placeholder="e.g. 25"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={selectClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Country</label>
            <select value={country} onChange={(e) => { setCountry(e.target.value); setState(""); setCity(""); }} className={selectClass}>
              <option value="">Select country</option>
              {countries.map((c) => (
                <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
              ))}
            </select>
          </div>

          {country && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">State / Province</label>
              <select value={state} onChange={(e) => { setState(e.target.value); setCity(""); }} className={selectClass}>
                <option value="">Select state</option>
                {states.map((s) => (
                  <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {(country && state) && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">City</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className={selectClass}>
                <option value="">Select city</option>
                {cities.map((c) => (
                  <option key={`${c.stateCode}-${c.name}`} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <Input label="Phone" type="tel" placeholder="Optional" value={phone} onChange={(e) => setPhone(e.target.value)} />

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Headline</label>
            <input
              className={selectClass}
              placeholder="e.g. Software Engineer | React & Node.js"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Professional summary</label>
            <textarea
              className={`${selectClass} min-h-[100px] resize-none`}
              placeholder="Brief summary of your experience and goals..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Work preference</label>
            <select value={workPreference} onChange={(e) => setWorkPreference(e.target.value)} className={selectClass}>
              <option value="">Select preference</option>
              {WORK_PREFERENCES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Work type</label>
            <select value={workType} onChange={(e) => setWorkType(e.target.value)} className={selectClass}>
              <option value="">Select type</option>
              {WORK_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Skills (comma-separated)</label>
            <input
              className={selectClass}
              placeholder="JavaScript, Python, React, "
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
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
