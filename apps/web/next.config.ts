import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'

const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL ?? ''

const config: NextConfig = {
  reactStrictMode: true,

  // ── CDN / asset prefix ─────────────────────────────────────────────────
  // Set NEXT_PUBLIC_CDN_URL to your CDN origin (e.g. https://cdn.anima.xyz)
  // and assets will be served from there in production builds.
  assetPrefix: CDN_URL || undefined,
  generateEtags: true,

  // ── Compression ─────────────────────────────────────────────────────────
  // Next.js built-in gzip compression (disabled if you terminate TLS at a
  // reverse proxy like Cloudflare, Nginx, or Vercel's edge network).
  compress: true,

  // ── Image optimization ──────────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 75, 85, 95],
    // Cache optimized images on the CDN for 60 days
    minimumCacheTTL: 60 * 24 * 60 * 60, // 60 days
    // Allow remote images from known sources
    remotePatterns: [
      { protocol: 'https', hostname: '**.s0nderlabs.xyz' },
      { protocol: 'https', hostname: '**.anima.xyz' },
    ],
  },

  // ── HTTP keep-alive ─────────────────────────────────────────────────────
  httpAgentOptions: {
    keepAlive: true,
  },

  // ── Transpile Zama SDK (ships as ESM, needs bundler handling) ──────────
  transpilePackages: ['@zama-fhe/sdk', '@zama-fhe/react-sdk'],

  // ── Bundle optimization ─────────────────────────────────────────────────
  // Tree-shake larger packages automatically
  experimental: {
    optimizePackageImports: [
      '@sentry/nextjs',
      'framer-motion',
      'viem',
      'wagmi',
      '@rainbow-me/rainbowkit',
      '@zama-fhe/sdk',
      '@zama-fhe/react-sdk',
    ],
  },

  // ── Server runtime ──────────────────────────────────────────────────────
  serverExternalPackages: ['@zama-fhe/sdk'],

  // ── Remove unnecessary headers ──────────────────────────────────────────
  poweredByHeader: false,

  // ── Security + caching headers ──────────────────────────────────────────
  async headers() {
    return [
      // ── Global security headers ─────────────────────────────────────────
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      // ── Static assets: long-lived cache ─────────────────────────────────
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // ── Landing page: CDN cache for 5 minutes ───────────────────────────
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
      // ── Docs: CDN cache for 1 hour (content changes infrequently) ───────
      {
        source: '/docs/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=3600',
          },
        ],
      },
    ]
  },


}

export default withSentryConfig(config, {
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
  disableLogger: true,
  autoInstrumentServerFunctions: true,
})
