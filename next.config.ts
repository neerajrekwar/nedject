import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@napi-rs/canvas',
    '@napi-rs/canvas-linux-x64-gnu',
    '@napi-rs/canvas-linux-x64-musl',
    'canvas',
  ],
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('@napi-rs/canvas', 'canvas');
      }
    }
    return config;
  },
};

export default nextConfig;
