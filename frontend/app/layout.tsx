import type { Metadata } from "next";
import { Syne, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://recruiter.solutions";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Recruiter.Solutions – Where talent meets opportunity",
    template: "%s | Recruiter.Solutions",
  },
  description: "Smart job matching for candidates and employers. AI assists, humans decide.",
  keywords: ["recruiting", "jobs", "AI matching", "candidates", "employers", "hiring"],
  authors: [{ name: "Recruiter.Solutions" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Recruiter.Solutions",
    title: "Recruiter.Solutions – Where talent meets opportunity",
    description: "Smart job matching for candidates and employers. AI assists, humans decide.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Recruiter.Solutions – Where talent meets opportunity",
    description: "Smart job matching for candidates and employers. AI assists, humans decide.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${syne.variable} ${manrope.variable} font-sans antialiased bg-[var(--bg-primary)] text-[var(--text-primary)]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
