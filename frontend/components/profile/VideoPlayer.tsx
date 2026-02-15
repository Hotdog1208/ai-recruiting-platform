"use client";

import { getApiUrl } from "@/lib/env";

type Props = {
  videoUrl: string;
  className?: string;
};

export function VideoPlayer({ videoUrl, className = "" }: Props) {
  const src = videoUrl.startsWith("http") ? videoUrl : `${getApiUrl()}${videoUrl}`;
  return (
    <video
      src={src}
      controls
      className={`w-full max-w-md rounded-lg border border-[var(--border)] ${className}`}
      playsInline
    />
  );
}
