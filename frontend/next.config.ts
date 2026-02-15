import type { NextConfig } from "next";
import path from "path";

// When Vercel builds with Root Directory = "frontend", the repo root (with its own
// package-lock.json) is still present. Pin the app root so Next.js/Turbopack
// doesn't infer the wrong workspace and break the build or deployment.
const appRoot = path.resolve(process.cwd());

const nextConfig: NextConfig = {
  turbopack: {
    root: appRoot,
  },
};

export default nextConfig;
