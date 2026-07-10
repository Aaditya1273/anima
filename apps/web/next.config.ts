import type { NextConfig } from 'next'

const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL ?? ''

const config: NextConfig = {
  reactStrictMode: true,

  assetPrefix: CDN_URL || undefined,
  generateEtags: true,
  compress: true,
  poweredByHeader: false,

  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 75, 85, 95],
    minimumCacheTTL: 60 * 24 * 60 * 60,
    remotePatterns: [
      { protocol: 'https', hostname: '**.s0nderlabs.xyz' },
      { protocol: 'https', hostname: '**.anima.xyz' },
    ],
  },

  httpAgentOptions: { keepAlive: true },

  // ── Bundle optimization ─────────────────────────────────────────────────
  // viem and rainbowkit are tree-shake-friendly. wagmi v3+ is safe to
  // include here since useConnection (used by @zama-fhe/react-sdk) is a
  // valid named export, so the namespace-import static-analysis issue is
  // resolved. @zama-fhe/* remain excluded to avoid browser-API SSR crashes.
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'viem',
      'wagmi',
      '@rainbow-me/rainbowkit',
    ],
  },

  // turbopack.root intentionally omitted — Next.js resolves correctly
  // when run via `pnpm --filter @anima/web dev` from the workspace root.

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' }],
      },
      {
        source: '/docs/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=3600' }],
      },
    ]
  },
}

export default config
