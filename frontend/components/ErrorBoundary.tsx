"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          className="min-h-[40vh] flex flex-col items-center justify-center px-6 py-16 text-center"
          role="alert"
        >
          <h2 className="text-display text-xl sm:text-2xl text-[var(--text-primary)] mb-3">
            Something went wrong
          </h2>
          <p className="text-[var(--text-secondary)] text-sm max-w-md mb-8">
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
