import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Required for @opennextjs/cloudflare edge runtime compatibility
  experimental: {
    // Allow importing .md files as raw strings
  },
  turbopack: {
    // Explicitly set workspace root to silence lockfile warning
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
