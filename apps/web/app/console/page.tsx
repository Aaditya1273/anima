'use client'

import { useSiwe } from '@/components/SiweContext'
import { ConsoleDashboard } from '@/components/console/ConsoleDashboard'
import { ConnectGate } from '@/components/console/ConnectGate'

export default function ConsoleHome() {
  const siwe = useSiwe()

  return (
    <div className="mx-auto w-full max-w-[var(--container-wrap)] px-6 pb-32 pt-28 sm:px-8 sm:pt-32">
      {siwe.status === 'loading' ? (
        // Holds layout while /api/auth/me resolves so the connect gate
        // doesn't flash for already-authed operators on hard refresh.
        <div className="min-h-[60vh]" aria-hidden />
      ) : siwe.status === 'authenticated' ? (
        <>
          <ConsoleDashboard />
        </>
      ) : (
        <div className="grid min-h-[60vh] place-items-center">
          <ConnectGate />
        </div>
      )}
    </div>
  )
}
