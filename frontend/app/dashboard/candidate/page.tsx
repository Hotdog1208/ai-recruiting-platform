"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { SaveJobButton } from "@/components/jobs/SaveJobButton";
import { ShareJobButton } from "@/components/jobs/ShareJobButton";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { JobCardSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { TiltCard } from "@/components/ui/TiltCard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type Job = {
  id: string;
  source: string;
  title: string;
  company?: string | null;
  location?: string | null;
  remote?: boolean | null;
  url?: string;
  match_score?: number;
  match_reason?: string;
  suggested_for_you?: boolean;
};

type Application = {
  id: string;
  job_id: string;
  job_title: string | null;
  job_location: string | null;
  job_remote: boolean | null;
  status: string;
  created_at: string | null;
};

type CandidateProfile = {
  id: string;
  full_name: string;
  location: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  headline?: string | null;
  skills: string[] | null;
  resume_parsed_data?: unknown;
  work_preference?: string | null;
  work_type?: string | null;
};

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return d.toLocaleDateString();
}

function CircularProgress({ value, size = 120 }: { value: number; size?: number }) {
  const r = size / 2 - 8;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center font-display" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="url(#gradient)" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-primary)" />
            <stop offset="100%" stopColor="var(--accent-secondary)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-2xl font-black text-white">{value}%</span>
      </div>
    </div>
  );
}

const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 } };

export default function CandidateDashboardPage() {
  const { user, session } = useAuth();
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user || !session?.access_token) return;
    setLoading(true);
    try {
      const [profileRes, appsRes, recRes] = await Promise.all([
        apiGet<CandidateProfile>(`/candidates/me`, session.access_token).catch(() => null),
        apiGet<Application[]>("/applications/by-candidate/me", session.access_token).catch(() => []),
        apiGet<Job[]>(`/matching/recommended`, session.access_token).catch(() => []),
      ]);
      setProfile(profileRes ?? null);
      setApplications(Array.isArray(appsRes) ? appsRes : []);
      setRecommendedJobs(Array.isArray(recRes) ? recRes : []);
    } catch {
      setRecommendedJobs([]);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [user, session?.access_token]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
         {/* Premium Loading Pulse */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-[var(--accent-primary)] animate-spin" />
          <div className="absolute inset-2 rounded-full border-r-2 border-[var(--accent-secondary)] animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        </div>
      </div>
    );
  }

  const firstName = (profile?.full_name || user?.user_metadata?.full_name || "there").split(" ")[0];
  const profileCompleteness = profile ? Math.round([!!profile.full_name, !!profile.location, profile.skills && profile.skills.length > 0, !!profile.resume_parsed_data, !!profile.work_preference, !!profile.work_type].filter(Boolean).length * (100 / 6)) : 0;
  
  const weeklyActivity = [0, 0, 0, 0];
  applications.forEach((a) => {
    if (!a.created_at) return;
    const weeksAgo = Math.floor((new Date().getTime() - new Date(a.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (weeksAgo >= 0 && weeksAgo < 4) {
      if (3 - weeksAgo >= 0) weeklyActivity[3 - weeksAgo]++;
    }
  });

  const chartData = {
    labels: ["W1", "W2", "W3", "W4"],
    datasets: [{
      label: "Applications", data: weeklyActivity,
      borderColor: "#00f0ff", backgroundColor: "rgba(0, 240, 255, 0.1)",
      tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: "#00f0ff"
    }]
  };

  const donutData = {
    labels: ["Pending", "Reviewing", "Interview", "Offer"],
    datasets: [{
      data: [
        applications.filter((a) => a.status === "pending").length,
        applications.filter((a) => a.status === "shortlisted" || a.status === "reviewed").length,
        applications.filter((a) => a.status === "interview").length,
        applications.filter((a) => a.status === "accepted").length
      ],
      backgroundColor: ["#ffce4d", "#0084ff", "#7a00ff", "#00ff87"],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

  return (
    <motion.div className="max-w-[1400px] mx-auto space-y-8" variants={staggerContainer} initial="initial" animate="animate">
      
      {/* 1. Hero Welcome Ribbon */}
      <motion.div variants={fadeUp} className="relative w-full rounded-[28px] overflow-hidden bg-black/40 border border-white/5 backdrop-blur-3xl p-10 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/10 blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 w-full md:w-auto">
           <h1 className="font-display text-4xl lg:text-5xl font-black text-white mb-2 tracking-tighter">
             Terminal Active, <span className="text-[var(--accent-primary)]">{firstName}</span>.
           </h1>
           <p className="text-gray-400 font-medium text-lg">
             The Artificial Intelligence has processed <strong className="text-white">{recommendedJobs.length}</strong> perfect matrix alignments.
           </p>
        </div>

        <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-6 shrink-0 shadow-xl">
           <CircularProgress value={profileCompleteness} size={80} />
           <div>
              <p className="text-white font-bold tracking-tight text-xl mb-1">Vector Index</p>
              <p className="text-gray-400 text-sm font-medium">Data structural integrity.</p>
           </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 2. Left Column (Stats & Jobs) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
           
           {/* Stat Bento Grid */}
           <motion.div variants={staggerContainer} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Active Pings", value: applications.length, trend: "In Play" },
                { title: "Vector Matches", value: recommendedJobs.length, trend: "Awaiting Action" },
                { title: "Interviews", value: applications.filter(a=>a.status==="interview").length, trend: "Upcoming" },
                { title: "Offers", value: applications.filter(a=>a.status==="accepted").length, trend: "Action Required" }
              ].map((s, i) => (
                 <motion.div key={i} variants={fadeUp}>
                    <TiltCard maxTilt={4} className="h-full">
                       <div className="card-interactive p-5 h-full flex flex-col justify-between">
                          <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">{s.title}</p>
                          <p className="font-display text-4xl font-black text-white mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{s.value}</p>
                          <p className="text-[11px] font-bold text-[var(--accent-primary)] uppercase tracking-wider">{s.trend}</p>
                       </div>
                    </TiltCard>
                 </motion.div>
              ))}
           </motion.div>

           {/* Recommended Jobs Masonry */}
           <motion.div variants={fadeUp} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="font-display text-2xl font-bold text-white tracking-tight">O(1) Vector Matches</h2>
                 <Link href="/jobs" className="text-xs font-bold tracking-widest text-[var(--accent-primary)] hover:text-white uppercase">Access Grid →</Link>
               </div>

              {recommendedJobs.length === 0 ? (
                 <div className="card-premium p-12 text-center border-dashed border-2 border-white/10">
                    <p className="text-gray-400 font-medium">Awaiting resume ingestion to populate tensor grid.</p>
                 </div>
              ) : (
                 <div className="grid sm:grid-cols-2 gap-4">
                   {recommendedJobs.slice(0, 4).map(job => (
                      <TiltCard key={job.id} maxTilt={2}>
                         <div className="card-interactive p-6 flex flex-col h-full bg-gradient-to-br from-black/60 to-white/5">
                            <div className="flex justify-between items-start mb-4">
                               <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl shadow-inner border border-white/10">💼</div>
                               {job.match_score && (
                                  <span className="bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 px-3 py-1 rounded-full text-xs font-black tracking-wide">
                                    {job.match_score}% MATCH
                                  </span>
                               )}
                            </div>
                            <h3 className="text-white font-bold text-lg mb-1">{job.title}</h3>
                            <p className="text-gray-400 text-sm font-medium mb-4">{job.company || "Unknown Entity"} • {job.location || "Remote"}</p>
                            
                            <div className="mt-auto flex justify-between items-center gap-2">
                               <Link href={`/jobs/${job.id}`} className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest py-3 flex items-center justify-center rounded-xl transition-colors">Inspect Data</Link>
                               <SaveJobButton jobId={job.id} />
                            </div>
                         </div>
                      </TiltCard>
                   ))}
                 </div>
              )}
           </motion.div>
        </div>

        {/* 3. Right Column (Activity & Timeline) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
           
           {/* Telemetry Chart */}
           <motion.div variants={fadeUp}>
              <TiltCard maxTilt={1}>
                 <div className="card-interactive p-6 border-white/5 bg-black/30 backdrop-blur-xl">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Pipeline Telemetry</h2>
                    <div className="h-40 w-full mb-6">
                       <Line data={chartData} options={chartOptions} />
                    </div>
                    <div className="h-[1px] w-full bg-white/10 mb-6" />
                    <div className="h-40 w-full relative flex items-center justify-center">
                       <Doughnut data={donutData} options={chartOptions} />
                       <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                          <span className="text-2xl font-black text-white">{applications.length}</span>
                          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Total</span>
                       </div>
                    </div>
                 </div>
              </TiltCard>
           </motion.div>

           {/* Activity Log */}
           <motion.div variants={fadeUp}>
               <div className="card-premium p-6 border-white/5 bg-black/40 backdrop-blur-xl h-full">
                  <h2 className="font-display text-lg font-bold text-white tracking-tight mb-6 flex items-center justify-between">
                     Action Log
                     <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                  </h2>
                  <div className="space-y-6 relative before:absolute before:inset-0 before:w-px before:bg-white/10 before:ml-[11px]">
                     {applications.length === 0 && <p className="text-gray-500 text-sm ml-8 font-medium">No actions detected yet.</p>}
                     {applications.slice(0, 4).map(app => (
                        <div key={app.id} className="relative flex items-start pl-8 group">
                           <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-black border border-white/20 flex items-center justify-center -translate-x-[50%] group-hover:border-[var(--accent-primary)] transition-colors">
                              <div className="w-2 h-2 rounded-full bg-gray-500 group-hover:bg-[var(--accent-primary)] transition-colors" />
                           </div>
                           <div className="flex flex-col">
                              <h4 className="text-white text-sm font-bold truncate max-w-[200px]">{app.job_title}</h4>
                              <p className="text-[11px] uppercase tracking-widest font-bold text-gray-500 mt-1">{app.status} • {formatTimeAgo(app.created_at)}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
           </motion.div>
        
        </div>
      </div>
    </motion.div>
  );
}
