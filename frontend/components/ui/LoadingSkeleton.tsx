"use client";

export function JobCardSkeleton() {
  return (
    <div className="job-card-skeleton glass-card p-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="skeleton-line h-5 rounded max-w-[75%]" style={{ width: "75%" }} />
            <div className="flex gap-2 shrink-0">
              <div className="skeleton-pill w-20 h-6 rounded-full" />
              <div className="skeleton-pill w-16 h-6 rounded-full" />
            </div>
          </div>
          <div className="skeleton-line h-4 rounded max-w-[50%]" style={{ width: "50%" }} />
          <div className="flex gap-3">
            <div className="skeleton-line w-24 h-4 rounded" />
            <div className="skeleton-line w-16 h-4 rounded" />
          </div>
        </div>
        <div className="skeleton-line w-28 h-10 rounded-lg shrink-0" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card-skeleton glass-card p-6 animate-pulse flex items-start gap-4">
      <div className="skeleton-circle w-12 h-12 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton-line w-20 h-4 rounded" />
        <div className="skeleton-line w-12 h-8 rounded" />
        <div className="skeleton-line w-24 h-3 rounded" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="p-4">
        <div className="space-y-2">
          <div className="skeleton-line w-48 h-4 rounded" />
          <div className="skeleton-line w-32 h-3 rounded" />
        </div>
      </td>
      <td className="p-4">
        <div className="skeleton-line w-24 h-4 rounded" />
      </td>
      <td className="p-4">
        <div className="skeleton-pill w-20 h-6 rounded-full" />
      </td>
      <td className="p-4">
        <div className="skeleton-line w-16 h-8 rounded" />
      </td>
    </tr>
  );
}
