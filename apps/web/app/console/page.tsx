'use client'

import { useSiwe } from '@/components/SiweContext'
import { ConnectGate } from '@/components/console/ConnectGate'
import { motion } from 'framer-motion'

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const

export default function ConsoleHome() {
  const siwe = useSiwe()

  return (
    <div className="mx-auto w-full max-w-[var(--container-wrap)] px-6 pb-32 pt-28 sm:px-8 sm:pt-32">
      {siwe.status === 'loading' ? (
        <div className="min-h-[60vh]" aria-hidden />
      ) : siwe.status === 'authenticated' ? (
        <>
          <header className="grid gap-3 pb-10">
            <motion.h1
              initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, ease: REVEAL_EASE }}
              className="font-display font-light leading-[1.02] tracking-tight text-[var(--color-ink)]"
              style={{
                fontSize: 'clamp(38px, 4.6vw, 68px)',
                fontVariationSettings: '"opsz" 96, "SOFT" 30, "WONK" 0',
              }}
            >
              Console
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: REVEAL_EASE }}
              className="text-base text-[var(--color-ink-2)]"
            >
              Manage your confidential payroll, registry positions, and distributions.
            </motion.p>
          </header>

          {/* TVS Dashboard — Phase 3 */}
          <div className="rounded-2xl border border-[var(--color-border)] p-8">
            <p className="text-sm text-[var(--color-ink-2)]">
              TVS dashboard and asset manager coming in Phase 3.
            </p>
          </div>
        </>
      ) : (
        <div className="grid min-h-[60vh] place-items-center">
          <ConnectGate />
        </div>
      )}
    </div>
  )
}
