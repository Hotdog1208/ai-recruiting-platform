import { forwardRef } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full min-h-[2.75rem] px-4 py-3 rounded-[var(--radius-input)] bg-[var(--bg-card)] border border-[var(--border)] text-[1rem] text-[var(--text)] placeholder:text-[var(--text-dim)]
            focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/50 transition-colors
            ${error ? "border-red-500/50 focus:ring-red-500/30" : ""}
            ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-[13px] text-red-400">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
