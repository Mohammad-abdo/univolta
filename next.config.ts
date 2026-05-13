import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  /**
   * Next.js 15.2+ can render metadata behind a streaming-only `<div hidden>` wrapper.
   * When that flag disagrees between the HTML shell and the RSC payload (common in dev /
   * HMR, embedded previews, or certain UAs), React throws a MetadataWrapper hydration error,
   * which then breaks `next/font` DOM cleanup (`removeChild`). Matching every non-empty UA
   * opts into the non-streaming metadata path for all browsers — same behavior Next uses
   * for HTML-limited bots — which avoids the mismatched tree shape.
   *
   * @see https://github.com/vercel/next.js/issues/79313
   */
  htmlLimitedBots: /.+/,

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
      // Wikimedia / Wikipedia
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      // Unsplash
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'uni-volta.com',
      },
    ],
    unoptimized: true,
  },

  // Proxy /uploads/* → backend so relative URLs work even without getImageUrl
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${BACKEND_URL}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
