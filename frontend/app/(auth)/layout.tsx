import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <header className="border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Link href="/" className="font-display font-bold text-[17px] text-white tracking-tight hover:text-[var(--accent)] transition-colors">
            Recruiter<span className="text-[var(--accent)]">.</span>Solutions
          </Link>
          <Link href="/" className="text-[13px] text-[var(--text-muted)] hover:text-white transition-colors font-medium">
            ← Back to home
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
