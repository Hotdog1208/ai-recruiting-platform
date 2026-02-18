"use client";

import { useMemo } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        color: "rgba(255,255,255,0.4)",
        font: { size: 11 },
      },
    },
    y: {
      grid: { color: "rgba(255,255,255,0.06)" },
      ticks: {
        color: "rgba(255,255,255,0.4)",
        font: { size: 11 },
      },
    },
  },
};

const BAR_DATA = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Matches",
      data: [340, 520, 680, 720, 890, 1040],
      backgroundColor: "rgba(0, 230, 118, 0.25)",
      borderColor: "rgba(0, 230, 118, 0.8)",
      borderWidth: 1,
      borderRadius: 6,
    },
    {
      label: "Jobs Posted",
      data: [120, 180, 220, 260, 310, 380],
      backgroundColor: "rgba(59, 130, 246, 0.25)",
      borderColor: "rgba(59, 130, 246, 0.8)",
      borderWidth: 1,
      borderRadius: 6,
    },
  ],
};

const LINE_DATA = {
  labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
  datasets: [
    {
      label: "Applications",
      data: [420, 580, 720, 890],
      borderColor: "rgba(0, 230, 118, 0.9)",
      backgroundColor: "rgba(0, 230, 118, 0.08)",
      fill: true,
      tension: 0.35,
    },
  ],
};

const METRICS = [
  { value: 4290, suffix: "+", label: "Successful matches", desc: "This year" },
  { value: 0, suffix: "%", label: "Bias in filtering", desc: "Zero by design" },
  { value: 2.3, suffix: "x", label: "Faster hires", desc: "vs. traditional" },
];

export function PlatformMetrics() {
  const barOptions = useMemo(
    () => ({
      ...CHART_OPTIONS,
      plugins: { ...CHART_OPTIONS.plugins, tooltip: { backgroundColor: "rgba(20,20,20,0.95)" } },
    }),
    []
  );

  return (
    <section className="relative py-20 sm:py-28 px-6 sm:px-8 lg:px-12 overflow-hidden border-y border-[var(--border)]">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)]/30 to-[var(--bg-primary)]" aria-hidden />
      <div className="relative max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-display text-[11px] uppercase tracking-[0.3em] text-[var(--accent-primary)] mb-4 font-semibold">
            Platform metrics
          </p>
          <h2 className="font-display text-[clamp(2rem, 4vw, 3rem)] font-bold text-white tracking-tight mb-4" style={{ letterSpacing: "-0.03em" }}>
            Trusted by thousands.
            <br />
            <span className="text-[var(--text-secondary)] font-normal">Real outcomes.</span>
          </h2>
        </motion.div>

        {/* Big metrics row */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
        >
          {METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]/60 p-8 backdrop-blur-sm hover:border-[var(--accent-primary)]/30 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <p className="font-display text-[clamp(2.25rem, 4vw, 3.5rem)] font-bold text-white tracking-tight mb-1">
                <AnimatedCounter value={m.value} suffix={m.suffix} duration={1.2} decimals={m.value >= 1000 ? 0 : 1} />
              </p>
              <p className="font-display text-[1.125rem] font-semibold text-white mb-1">{m.label}</p>
              <p className="text-[var(--text-secondary)] text-sm">{m.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]/50 p-6 sm:p-8 backdrop-blur-sm"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="font-display text-lg font-semibold text-white mb-6">Matches & jobs over time</h3>
            <div className="h-[260px]">
              <Bar data={BAR_DATA} options={barOptions} />
            </div>
          </motion.div>
          <motion.div
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]/50 p-6 sm:p-8 backdrop-blur-sm"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="font-display text-lg font-semibold text-white mb-6">Weekly applications trend</h3>
            <div className="h-[260px]">
              <Line data={LINE_DATA} options={{ ...CHART_OPTIONS, plugins: { ...CHART_OPTIONS.plugins, tooltip: { backgroundColor: "rgba(20,20,20,0.95)" } } }} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
