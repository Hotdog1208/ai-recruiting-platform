import { cn } from "@/lib/utils";

type Size = "sm" | "medium" | "lg";

const sizeClasses: Record<Size, string> = {
  sm: "w-6 h-6 border-2",
  medium: "w-12 h-12 border-2",
  lg: "w-16 h-16 border-[3px]",
};

export function LoadingSpinner({
  size = "medium",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center p-2",
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <div
        className={cn(
          "rounded-full border-[var(--accent-primary)] border-t-transparent animate-spin",
          sizeClasses[size]
        )}
      />
    </div>
  );
}
