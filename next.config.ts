import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  serverExternalPackages: [
    '@napi-rs/canvas',
    'canvas',
  ],
};

export default nextConfig;
