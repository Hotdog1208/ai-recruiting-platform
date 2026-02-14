import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Navbar />
      {/* Spacer so content starts below floating pill (pill bottom ~5.5rem) */}
      <main className="flex-1 pt-[6.25rem]">{children}</main>
      <Footer />
    </div>
  );
}
