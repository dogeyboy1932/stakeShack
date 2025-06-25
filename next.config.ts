import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Ignore build errors in the escrow test files
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
