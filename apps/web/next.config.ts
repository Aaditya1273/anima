import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 75, 85, 95],
  },
  // Transpile Zama SDK (ships as ESM, needs bundler handling in Next.js)
  transpilePackages: ['@zama-fhe/sdk', '@zama-fhe/react-sdk'],
}

export default config
