import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cursor Simple Browser uses 127.0.0.1; allow dev assets (HMR, fonts) cross-origin.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },
  // Next 16 defaults to Turbopack; keep empty config alongside webpack watchOptions.
  turbopack: {},
  // Avoid EMFILE (too many open files) from watching unrelated dirs
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/.git/**",
          "**/node_modules/**",
          "**/.next/**",
          "**/.lab3-tmp/**",
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
