"use client";

import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

/** Animates from 0 to `value` when the ref element enters view. For numbers only. */
export function AnimatedCounter({
  value,
  duration = 1.2,
  decimals = 0,
  suffix = "",
  prefix = "",
  className = "",
}: {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });

  useEffect(() => {
    if (!inView) return;
    let start: number;
    const step = (t: number) => {
      if (!start) start = t;
      const elapsed = t - start;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(easeOut * value);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value, duration]);

  const display = decimals > 0 ? count.toFixed(decimals) : Math.round(count).toString();
  return (
    <span ref={ref} className={className}>
      {prefix}{display}{suffix}
    </span>
  );
}
