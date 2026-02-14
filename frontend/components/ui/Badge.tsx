import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "error" | "outline";
};

const variantStyles = {
  default: "bg-white/10 text-zinc-300 border-white/10",
  success: "bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent)]/30",
  warning: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  error: "bg-red-500/20 text-red-300 border-red-500/30",
  outline: "bg-transparent text-zinc-400 border-white/20",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
