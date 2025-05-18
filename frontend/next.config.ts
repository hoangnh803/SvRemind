import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',  // Use static export for prerendering
  distDir: '.next',  // Keep the same dist directory name
};

export default nextConfig;
