import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.figma.com',
        pathname: '/api/mcp/asset/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
    ],
    unoptimized: false, // Keep optimization but allow localhost
  },
};

export default nextConfig;
