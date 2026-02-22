"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Line, Doughnut } from "react-chartjs-2";
import { TiltCard } from "@/components/ui/TiltCard";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, ArcElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

type Job = { id: string; title: string; description?: string | null; location: string | null; remote: boolean | null; created_at?: string; };
type EmployerProfile = { id: string; company_name: string; industry: string | null; };
type Applicant = { id: string; job_id: string; job_title?: string; candidate_id: string; candidate_name: string | null; candidate_location: string | null; candidate_skills: string[] | null; status: string; created_at: string | null; };

const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 } };

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const diff = new Date().getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

export default function EmployerDashboardPage() {
  const { user, session } = useAuth();
  const toast = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newJob, setNewJob] = useState({ title: "", description: "", location: "", remote: false });
  const [submitting, setSubmitting] = useState(false);
  const [jobError, setJobError] = useState("");
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [applicantCounts, setApplicantCounts] = useState<Record<string, number>>({});
  const [allApplicants, setAllApplicants] = useState<(Applicant & { job_title?: string })[]>([]);

  const loadData = useCallback(async () => {
    if (!user || !session?.access_token) return;
    setLoading(true);
    try {
      const profileRes = await apiGet<EmployerProfile>("/employers/me", session.access_token).catch(() => null);
      setProfile(profileRes);
      if (!profileRes?.id) return;
      const jobsRes = await apiGet<Job[]>("/jobs/mine", session.access_token).catch(() => []);
      setJobs(jobsRes);
      
      const counts: Record<string, number> = {};
      const applicants: (Applicant & { job_title?: string })[] = [];
      for (const job of jobsRes) {
        try {
           const apps = await apiGet<Applicant[]>(`/applications/by-job/${job.id}`, session.access_token);
           counts[job.id] = apps.length;
           apps.forEach(a => applicants.push({ ...a, job_title: job.title, job_id: job.id }));
        } catch { counts[job.id] = 0; }
      }
      setApplicantCounts(counts);
      setAllApplicants(applicants.sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
    } finally { setLoading(false); }
  }, [user, session]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmitting(true);
    setJobError("");
    try {
      await apiPost("/jobs", { title: newJob.title.trim(), description: newJob.description.trim() || undefined, location: newJob.location.trim() || undefined, remote: newJob.remote }, session?.access_token);
      setNewJob({ title: "", description: "", location: "", remote: false });
      setShowForm(false);
      loadData();
      toast.success("Job instantiated successfully.");
    } catch (err) {
      setJobError(err instanceof Error ? err.message : "Failed to create job");
    } finally { setSubmitting(false); }
  };

  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;
    try {
      await apiDelete(`/jobs/${jobToDelete}`, session?.access_token);
      loadData();
      toast.success("Job record purged.");
    } finally { setJobToDelete(null); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-[var(--accent-secondary)] animate-spin" />
        </div>
      </div>
    );
  }

  const companyName = profile?.company_name || "Enterprise Node";
  const pendingApps = allApplicants.filter(a => a.status === "pending");
  const activeJobs = jobs.length;

  const weeklyActivity = [0, 0, 0, 0];
  allApplicants.forEach(a => {
    if (!a.created_at) return;
    const w = Math.floor((new Date().getTime() - new Date(a.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (w >= 0 && w < 4) weeklyActivity[3 - w]++;
  });

  const chartData = {
    labels: ["W1", "W2", "W3", "W4"],
    datasets: [{
      label: "Inbound Tensors", data: weeklyActivity,
      borderColor: "#7a00ff", backgroundColor: "rgba(122, 0, 255, 0.1)",
      tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: "#7a00ff"
    }]
  };

  const donutData = {
    labels: ["Pending", "Reviewing", "Interview", "Offer"],
    datasets: [{
      data: [
        allApplicants.filter(a => a.status === "pending").length,
        allApplicants.filter(a => a.status === "shortlisted" || a.status === "reviewed").length,
        allApplicants.filter(a => a.status === "interview").length,
        allApplicants.filter(a => a.status === "accepted").length
      ],
      backgroundColor: ["#ffce4d", "#00f0ff", "#7a00ff", "#00ff87"],
      borderWidth: 0, hoverOffset: 4
    }]
  };
  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

  return (
    <motion.div className="max-w-[1400px] mx-auto space-y-8" variants={staggerContainer} initial="initial" animate="animate">
      
      {/* 1. Hero Welcome Ribbon */}
      <motion.div variants={fadeUp} className="relative w-full rounded-[28px] overflow-hidden bg-black/40 border border-white/5 backdrop-blur-3xl p-10 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
         <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[var(--accent-secondary)]/20 to-[var(--accent-primary)]/10 blur-[100px] pointer-events-none" />
         
         <div className="relative z-10 w-full md:w-auto">
            <h1 className="font-display text-4xl lg:text-5xl font-black text-white mb-2 tracking-tighter">
              Terminal Active, <span className="text-[var(--accent-secondary)]">{companyName}</span>.
            </h1>
            <p className="text-gray-400 font-medium text-lg">
              You are currently monitoring <strong className="text-white">{activeJobs}</strong> active job pipelines.
            </p>
         </div>

         <div className="relative z-10 shrink-0">
            <Button onClick={() => setShowForm(true)} className="bg-[var(--accent-secondary)] hover:bg-[var(--accent-secondary)]/80 text-white font-bold py-4 px-8 rounded-full shadow-[0_0_20px_rgba(122,0,255,0.3)]">
               INITIALIZE NEW ROLE
            </Button>
         </div>
      </motion.div>

      {/* Post Job Modal */}
      <AnimatePresence>
         {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
               <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-lg card-interactive p-8 bg-black/60 border-white/10 shadow-2xl">
                  <h2 className="font-display text-2xl font-bold text-white mb-6">Create Requirement Vector</h2>
                  <form onSubmit={handleCreateJob} className="space-y-4">
                     {jobError && <div className="text-red-500 text-sm font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">{jobError}</div>}
                     <Input label="JOB TITLE" placeholder="Lead AI Engineer" value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} required />
                     <div>
                        <label className="block text-xs font-bold tracking-widest text-gray-400 mb-2">DESCRIPTION PARAMETERS</label>
                        <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white min-h-[120px] focus:border-[var(--accent-secondary)] focus:outline-none transition-colors" placeholder="Detailed requirements..." value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} />
                     </div>
                     <Input label="LOCATION ORB" placeholder="San Francisco, CA" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} />
                     <div className="flex items-center gap-3 mt-2">
                        <input type="checkbox" id="remote" checked={newJob.remote} onChange={e => setNewJob({ ...newJob, remote: e.target.checked })} className="w-5 h-5 rounded border-white/20 bg-white/5 text-[var(--accent-secondary)] accent-[var(--accent-secondary)] cursor-pointer" />
                        <label htmlFor="remote" className="text-sm font-bold text-gray-300 tracking-wide cursor-pointer">Allow Remote Instances</label>
                     </div>
                     <div className="flex gap-4 mt-8">
                        <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Abort</Button>
                        <Button type="submit" isLoading={submitting} className="flex-1 bg-[var(--accent-secondary)] hover:bg-[var(--accent-secondary)]/80 text-white">Execute Creation</Button>
                     </div>
                  </form>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* 2. Left Column (Stats & Jobs Table) */}
         <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Stat Bento Grid */}
            <motion.div variants={staggerContainer} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                  { title: "Active Positions", value: activeJobs, trend: "Broadcasting" },
                  { title: "Total Inbounds", value: allApplicants.length, trend: "Processed Vectors" },
                  { title: "Pending Review", value: pendingApps.length, trend: "Requires Attention" },
                  { title: "Hired Nodes", value: allApplicants.filter(a=>a.status==="accepted").length, trend: "Successfully Merged" }
               ].map((s, i) => (
                  <motion.div key={i} variants={fadeUp}>
                     <TiltCard maxTilt={4} className="h-full">
                        <div className="card-interactive p-5 h-full flex flex-col justify-between border-white/5 bg-gradient-to-br from-[var(--bg-elevated)] to-black/30">
                           <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">{s.title}</p>
                           <p className="font-display text-4xl font-black text-white mb-1 drop-shadow-[0_0_15px_rgba(122,0,255,0.2)]">{s.value}</p>
                           <p className="text-[11px] font-bold text-[var(--accent-secondary)] uppercase tracking-wider">{s.trend}</p>
                        </div>
                     </TiltCard>
                  </motion.div>
               ))}
            </motion.div>

            {/* Active Jobs Grid / List */}
            <motion.div variants={fadeUp} className="card-premium border-white/5 bg-black/40 backdrop-blur-xl p-6">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="font-display text-2xl font-bold text-white tracking-tight">Active Requirement Vectors</h2>
               </div>
               
               {jobs.length === 0 ? (
                  <div className="p-12 text-center border-dashed border-2 border-white/10 rounded-2xl">
                     <p className="text-gray-400 font-medium mb-4">No active pipelines detected.</p>
                     <Button onClick={() => setShowForm(true)} className="bg-white/10 hover:bg-white/20 text-white">Initialize Core Job</Button>
                  </div>
               ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="border-b border-white/5 text-gray-500 text-xs font-bold tracking-widest uppercase">
                              <th className="pb-4 pl-4">Position</th>
                              <th className="pb-4">Inbounds</th>
                              <th className="pb-4">Status</th>
                              <th className="pb-4 text-right pr-4">Actions</th>
                           </tr>
                        </thead>
                        <tbody>
                           {jobs.map(job => (
                              <tr key={job.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                 <td className="py-4 pl-4">
                                    <h4 className="text-white font-bold">{job.title}</h4>
                                    <p className="text-xs text-gray-400 mt-1">{job.location || "Remote"}</p>
                                 </td>
                                 <td className="py-4 font-black text-white">{applicantCounts[job.id] || 0}</td>
                                 <td className="py-4">
                                    <span className="bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)] border border-[var(--accent-secondary)]/30 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                                       ACTIVE
                                    </span>
                                 </td>
                                 <td className="py-4 text-right pr-4">
                                    <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                       <Link href={`/jobs/${job.id}/applicants`} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white uppercase tracking-wider transition-colors">Inspect Vectors</Link>
                                       <button onClick={() => setJobToDelete(job.id)} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold uppercase transition-colors">Purge</button>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}
            </motion.div>
         </div>

         {/* 3. Right Column (Charts & Rapid Pipeline) */}
         <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Telemetry Multi-Chart */}
            <motion.div variants={fadeUp}>
               <TiltCard maxTilt={1}>
                  <div className="card-interactive p-6 border-white/5 bg-black/30 backdrop-blur-xl">
                     <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Inbound Velocity</h2>
                     <div className="h-40 w-full mb-6 relative">
                        {allApplicants.length === 0 ? (
                           <div className="absolute inset-0 flex items-center justify-center"><p className="text-[11px] text-gray-600 font-bold uppercase tracking-widest">Awaiting Data</p></div>
                        ) : (
                           <Line data={chartData} options={chartOptions} />
                        )}
                     </div>
                     <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 pt-4 border-t border-white/5">Pipeline Distribution</h2>
                     <div className="h-40 w-full relative flex items-center justify-center">
                        {allApplicants.length === 0 ? (
                           <div className="absolute inset-0 flex items-center justify-center"><p className="text-[11px] text-gray-600 font-bold uppercase tracking-widest">Awaiting Data</p></div>
                        ) : (
                           <>
                              <Doughnut data={donutData} options={chartOptions} />
                              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                 <span className="text-2xl font-black text-white">{allApplicants.length}</span>
                                 <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Total</span>
                              </div>
                           </>
                        )}
                     </div>
                  </div>
               </TiltCard>
            </motion.div>

            {/* Quick Pending Review List */}
            <motion.div variants={fadeUp}>
               <div className="card-premium p-6 border-white/5 bg-black/40 backdrop-blur-xl">
                  <h2 className="font-display text-lg font-bold text-white tracking-tight mb-4 flex items-center justify-between">
                     Priority Queue
                     <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-[10px] font-black">{pendingApps.length}</span>
                  </h2>
                  <div className="space-y-3">
                     {pendingApps.length === 0 ? (
                        <p className="text-gray-500 text-sm font-medium italic">No pending applications.</p>
                     ) : (
                        pendingApps.slice(0, 5).map(app => (
                           <Link key={app.id} href={`/jobs/${app.job_id}/applicants`} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 group">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--accent-secondary)]/20 border border-[var(--accent-secondary)]/20 flex items-center justify-center font-black text-white">
                                 {(app.candidate_name || "?").charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h4 className="text-sm font-bold text-white truncate">{app.candidate_name || "Unknown Identity"}</h4>
                                 <p className="text-xs text-[var(--accent-secondary)] font-bold tracking-wider uppercase truncate">{app.job_title}</p>
                              </div>
                              <svg className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                           </Link>
                        ))
                     )}
                  </div>
                  {pendingApps.length > 5 && (
                     <div className="mt-4 pt-4 border-t border-white/5 text-center">
                        <Link href="/jobs" className="text-xs font-bold uppercase tracking-widest text-[var(--accent-secondary)] hover:text-white transition-colors">View All In pipeline →</Link>
                     </div>
                  )}
               </div>
            </motion.div>
         </div>
      </div>

      <Dialog open={!!jobToDelete} onOpenChange={() => setJobToDelete(null)}>
        <DialogContent className="bg-[#080808] border-white/10 p-0 overflow-hidden">
          <div className="p-8">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl font-bold text-white mb-2">Confirm Purge Operation</DialogTitle>
              <DialogDescription className="text-gray-400">
                Are you absolute sure you want to permanently delete this job pipeline? This action will obliterate all associated application vectors and cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-8 flex gap-3 sm:justify-end">
              <Button variant="ghost" onClick={() => setJobToDelete(null)}>Abort</Button>
              <Button onClick={confirmDeleteJob} className="bg-red-500 hover:bg-red-600 text-white font-bold">Execute Purge</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
