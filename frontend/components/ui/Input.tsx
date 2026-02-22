import { forwardRef } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full relative group">
        {label && (
          <label className="block text-sm font-semibold tracking-wide text-gray-400 mb-2 transition-colors group-focus-within:text-[var(--accent-primary)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full min-h-[3.5rem] px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-lg text-white placeholder:text-gray-600
            focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl
            ${error ? "border-red-500/50 focus:ring-red-500/30" : ""}
            ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-500 font-bold">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
