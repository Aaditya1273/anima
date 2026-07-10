'use client'

import { estimateMevExposure } from '@/lib/tokenops/client'
import { useMemo } from 'react'

type Props = {
  /** Total raw amount (sum of all recipient amounts in decimals, e.g. 6dp USDC) */
  totalRaw: number
  /** Whether recipients have been added (show the calculator) */
  hasRecipients: boolean
}

export function RiskCalculator({ totalRaw, hasRecipients }: Props) {
  const mev = useMemo(() => {
    const totalBigInt = BigInt(Math.floor(totalRaw * 1e6))
    return estimateMevExposure(totalBigInt)
  }, [totalRaw])

  const mevDisplay = hasRecipients ? `~${(Number(mev.exposedAmount) / 1e6).toFixed(2)} tokens` : '—'

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5">
      <h3 className="font-display text-[15px] font-medium text-[var(--color-ink)]">
        ⚠ MEV risk estimate
      </h3>
      <p className="mt-1 text-[13px] leading-[1.55] text-[var(--color-ink-2)]">
        A public distribution of this size would expose approximately:
      </p>
      <div className="mt-3">
        <div className="font-mono text-[22px] text-[var(--color-ink)]">{mevDisplay}</div>
        <div className="font-mono text-[12px] text-[var(--color-ink-3)]">
          to MEV front-runs (est. 17% within 72h)
        </div>
      </div>
      <p className="mt-3 text-[12px] leading-[1.5] text-[var(--color-ink-2)]">
        Source: TokenOps acquisition data. An encrypted distribution prevents this entirely.
      </p>
    </div>
  )
}
