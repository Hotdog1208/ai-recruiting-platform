export function Card({
  children,
  className = "",
  hover,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`card-sharp bg-[var(--bg-card)] border-[var(--border)] ${hover ? "hover:border-[var(--border-strong)] hover:shadow-[0_0_0_1px_var(--border-strong)] transition-all duration-300" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
