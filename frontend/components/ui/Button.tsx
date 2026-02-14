import { forwardRef } from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, className = "", children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-[var(--radius-button)]";
    const variants = {
      primary: "bg-[var(--accent)] text-[#080808] hover:bg-[var(--accent-hover)] shadow-[0_8px_24px_-6px_var(--accent-dim)] hover:shadow-[0_12px_28px_-6px_var(--accent-dim)] hover:-translate-y-0.5 active:translate-y-0",
      secondary: "bg-[var(--bg-elevated)] text-[var(--text)] border border-[var(--border-strong)] hover:border-[var(--text-dim)] hover:bg-white/[0.04]",
      ghost: "text-[var(--text-muted)] hover:text-white hover:bg-white/[0.04] border border-transparent",
      outline: "border-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-dim)]",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-[13px]",
      md: "px-4 py-2.5 text-[13px]",
      lg: "px-6 py-3 text-[15px]",
    };
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
