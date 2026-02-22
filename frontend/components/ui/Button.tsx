"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";

type ButtonProps = Omit<React.ComponentProps<typeof motion.button>, "ref"> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, className = "", children, disabled, ...props }, ref) => {
    // Map our new global CSS deep styling classes to React variants
    const variants = {
      primary: "btn-primary",
      secondary: "bg-white/5 text-white border border-white/10 hover:border-white/20 hover:bg-white/10 shadow-lg",
      ghost: "btn-ghost",
      outline: "border border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 shadow-[0_0_15px_rgba(0,240,255,0.1)]",
    };
    
    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        ref={ref}
        className={`inline-flex items-center justify-center font-bold font-body transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
