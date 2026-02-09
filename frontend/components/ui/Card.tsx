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
      className={`bg-[#1a1a1a] rounded-xl border border-white/5 ${hover ? "hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-300" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
