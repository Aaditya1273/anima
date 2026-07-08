'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type Props = {
  /** The plaintext value after decryption, or null if still encrypted */
  value: string | null
  /** Whether decryption is in progress */
  isLoading?: boolean
  /** Label shown to the left of the amount */
  label?: string
  /** Token symbol suffix */
  symbol?: string
  /** Called when user clicks to reveal */
  onReveal?: () => void
  /** Whether the value is a balance, allocation, etc. */
  variant?: 'balance' | 'allocation' | 'salary'
}

export function ConfidentialAmount({
  value,
  isLoading = false,
  label,
  symbol,
  onReveal,
  variant = 'balance',
}: Props) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-4 py-3">
      <div className="flex flex-col">
        {label && (
          <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
            {label}
          </span>
        )}
        <div className="mt-0.5 flex items-baseline gap-2">
          {value !== null ? (
            <motion.span
              initial={{ opacity: 0, filter: 'blur(6px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              className="font-mono text-[15px] text-[var(--color-ink)]"
            >
              {value}
              {symbol ? <span className="ml-1 text-[var(--color-ink-3)]">{symbol}</span> : null}
            </motion.span>
          ) : (
            <div className="flex items-center gap-2">
              <ShieldBadge />
              <span className="font-mono text-[13px] text-[var(--color-ink-3)]">
                {isLoading ? 'Decrypting…' : 'Encrypted'}
              </span>
            </div>
          )}
        </div>
      </div>
      {value === null && onReveal && !isLoading ? (
        <button
          type="button"
          onClick={onReveal}
          className="shrink-0 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)]"
        >
          Reveal
        </button>
      ) : null}
      {value !== null ? (
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="shrink-0 text-[18px]"
          aria-label="Decrypted"
        >
          🔓
        </motion.span>
      ) : null}
    </div>
  )
}

export function ShieldBadge() {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--color-border-strong)] text-[10px] text-[var(--color-ink-3)]">
      🔒
    </span>
  )
}

export function ShieldBadgeAnimated() {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-1 rounded-full bg-[var(--color-ink)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-cream)]"
    >
      <span>Encrypted</span>
    </motion.span>
  )
}
