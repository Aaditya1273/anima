'use client'

import { motion } from 'framer-motion'

const SURFACES = [
  {
    name: 'Payroll',
    contract: 'AnimaPayroll.sol',
    icon: '💼',
    description: 'Encrypted salary balances in the payroll vault.',
    tvsLabel: 'Deposited (encrypted)',
    value: '—',
    pending: true,
  },
  {
    name: 'Registry',
    contract: 'AnimaRegistryRouter.sol',
    icon: '🔄',
    description: 'Wrapped ERC-7984 token balances via the official pairs.',
    tvsLabel: 'Wrapped (encrypted)',
    value: '—',
    pending: true,
  },
  {
    name: 'Disperse',
    contract: 'AnimaDisperse.sol',
    icon: '📤',
    description: 'Unclaimed encrypted distribution allocations.',
    tvsLabel: 'Allocated (encrypted)',
    value: '—',
    pending: true,
  },
]

export function TvsDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-[22px] font-light tracking-tight text-[var(--color-ink)]"
            style={{ fontVariationSettings: '"opsz" 96, "SOFT" 30, "WONK" 0' }}>
          Total Value Shielded
        </h2>
        <p className="mt-1 text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
          Encrypted TVL across all three Anima surfaces. TVS is computed from{' '}
          <code className="rounded bg-[var(--color-paper)] px-1.5 py-0.5 font-mono text-[12px]">
            IERC7984.totalEncryptedSupply()
          </code>
          — no decryption needed.
        </p>
      </div>

      {/* TVS aggregate */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
              TOTAL VALUE SHIELDED
            </span>
            <div className="mt-1 font-mono text-[28px] text-[var(--color-ink)]">
              {SURFACES.every(s => s.pending) ? (
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Waiting for deployment…
                </motion.span>
              ) : (
                '—'
              )}
            </div>
          </div>
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-ink)]"
            aria-label="Live"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-cream)]" />
          </motion.div>
        </div>
      </div>

      {/* Per-surface breakdown */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SURFACES.map((surface, i) => (
          <motion.div
            key={surface.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
                {surface.name}
              </span>
              <span className="text-[18px]" aria-hidden>{surface.icon}</span>
            </div>
            <div className="mt-3">
              <span className="font-mono text-[20px] text-[var(--color-ink)]">
                {surface.pending ? (
                  <span className="text-[var(--color-ink-3)]">Pending deploy</span>
                ) : (
                  surface.value
                )}
              </span>
              <span className="ml-2 font-mono text-[12px] text-[var(--color-ink-3)]">
                {surface.tvsLabel}
              </span>
            </div>
            <p className="mt-2 text-[12.5px] leading-[1.5] text-[var(--color-ink-2)]">
              {surface.description}
            </p>
            <div className="mt-3 font-mono text-[11px] text-[var(--color-ink-3)]">
              {surface.contract}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Encrypted supply"
          value="Queries IERC7984.totalEncryptedSupply()"
          pending
        />
        <MetricCard
          label="Underlying assets"
          value="USDC, USDT, WETH, …"
          pending
        />
        <MetricCard
          label="Last updated"
          value="On every chain block"
          pending
        />
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  pending,
}: {
  label: string
  value: string
  pending?: boolean
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-4">
      <div className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
        {label}
      </div>
      <div className={`mt-1 text-[13px] leading-[1.5] ${pending ? 'text-[var(--color-ink-3)]' : 'text-[var(--color-ink-2)]'}`}>
        {value}
      </div>
    </div>
  )
}
