import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: process.env.DEV_HOST ? [process.env.DEV_HOST] : [],
};

export default nextConfig;
