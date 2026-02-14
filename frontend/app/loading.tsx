"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--bg-primary)]" aria-live="polite" aria-busy="true">
      <div className="w-12 h-12 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" />
      <p className="mt-6 text-sm font-medium text-[var(--text-secondary)] uppercase tracking-widest">
        Loading
      </p>
    </div>
  );
}
