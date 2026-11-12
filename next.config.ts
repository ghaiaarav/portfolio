import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a second server (e.g. `next dev` beside `next start`) use its own build folder.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  transpilePackages: ["skinview3d"],
};

export default nextConfig;
