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
      {
        protocol: 'https',
        hostname: 'univolta.developteam.site',
        pathname: '/uploads/**',
      },
      // Wikimedia / Wikipedia — Egyptian university real images
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      // Unsplash — free high-quality university campus photos
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
