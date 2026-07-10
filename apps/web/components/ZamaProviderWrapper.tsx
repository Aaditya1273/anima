'use client'

import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'

/**
 * Dynamically imported ZamaProvider wrapper.
 *
 * Using `ssr: false` ensures the Zama SDK (which uses IndexedDB,
 * SubtleCrypto, and other browser APIs) is never evaluated on the
 * server, preventing SSR crashes.
 */
export const ZamaProviderWrapper = dynamic<{ children: ReactNode }>(
  () =>
    import('./ZamaProviderInner').then((mod) => ({
      default: mod.ZamaProviderInner,
    })),
  { ssr: false },
)
