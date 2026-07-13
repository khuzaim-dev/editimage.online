import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sharp uses native binaries — must be excluded from bundling on Vercel
  serverExternalPackages: ["sharp", "@imgly/background-removal-node"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
  },
};

export default nextConfig;
