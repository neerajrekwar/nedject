import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: '/app/applet',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
