'use client'

import { CONTRACTS, addressUrl, truncate } from '@/lib/chainscan'
import { TVS_BREAKDOWN, DISPERSE_STATS, PAYROLL_STATS } from '@/lib/snapshot'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { LayerHeader } from './V2Identity'

export function V7Economy() {
  return (
    <section
      id="layer-economy"
      className="relative flex min-h-screen items-center py-[var(--section-py)]"
    >
      <div className="mx-auto w-full max-w-[var(--container-wrap)] px-6 sm:px-8">
        <LayerHeader idx="06" title="TVS Dashboard" pill="Ethereum Sepolia · Aggregate" />
        <div className="mb-10 grid items-baseline gap-8 lg:grid-cols-12">
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(36px,5vw,68px)] font-light leading-[1.04] tracking-[-0.018em] text-[var(--color-ink)] lg:col-span-7"
          >
            Value <span className="font-italic-serif italic">visible at a glance</span>.
          </motion.h2>
          <p className="max-w-md text-[15px] leading-relaxed text-[var(--color-ink-2)] lg:col-span-5">
            Total Value Shielded across all three surfaces. Payroll vault, wrapped balances,
            and pending distributions — all counted via on-chain totalEncryptedSupply.
            The aggregate is always public. The details stay encrypted.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <VaultPane />
          <DispersePane />
          <RegistryPane />
        </div>
      </div>
    </section>
  )
}

function VaultPane() {
  return (
    <PaneShell label="Payroll Vault" symbol="Σ">
      <div className="flex items-baseline justify-between">
        <div className="font-display text-[34px] leading-none text-[var(--color-ink)]">
          {TVS_BREAKDOWN.payroll.value.toLocaleString()}
        </div>
        <span className="font-mono text-[10.5px] tracking-[0.04em] text-[var(--color-ink-3)]">
          USDC Shielded
        </span>
      </div>
      <div className="mt-4 space-y-1.5 border-t border-[var(--color-border)] pt-3">
        <Row label="Active Employees" value={`${PAYROLL_STATS.activeEmployees}`} />
        <Row label="Salaries Paid" value={`${PAYROLL_STATS.totalSalariesPaid}`} />
        <Row label="Yield Sub-Account" value="Internal FHE accounting" />
        <Row label="Pending Yield" value={PAYROLL_STATS.pendingYieldDeposits === 1 ? '1 deposit' : '0'} />
      </div>
      <Refresh />
    </PaneShell>
  )
}

function DispersePane() {
  return (
    <PaneShell label="Distributions" symbol="↗">
      <div className="flex items-baseline justify-between">
        <div className="font-display text-[34px] leading-none text-[var(--color-ink)]">
          {TVS_BREAKDOWN.disperse.value.toLocaleString()}
        </div>
        <span className="font-mono text-[10.5px] tracking-[0.04em] text-[var(--color-ink-3)]">
          USDC Distributed
        </span>
      </div>
      <div className="mt-4 space-y-1.5 border-t border-[var(--color-border)] pt-3">
        <Row label="Distributions" value={`${DISPERSE_STATS.distributionsCreated}`} />
        <Row label="Total Recipients" value={`${DISPERSE_STATS.totalRecipients}`} />
        <Row label="Active" value={`${DISPERSE_STATS.activeDistributions}`} />
        <Row label="Last Tx" value={truncate(DISPERSE_STATS.lastDistributionTx, 8, 6)} />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.18, 1] }}
          transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
          className="block h-2 w-2 rounded-full bg-[var(--color-ink)]"
        />
        <span className="font-mono text-[10px] tracking-[0.04em] text-[var(--color-ink-2)]">
          All encrypted
        </span>
      </div>
    </PaneShell>
  )
}

function RegistryPane() {
  return (
    <PaneShell label="Wrapped Balances" symbol="🔒">
      <div className="flex items-baseline justify-between">
        <div className="font-display text-[34px] leading-none text-[var(--color-ink)]">
          {TVS_BREAKDOWN.registry.value.toLocaleString()}
        </div>
        <span className="font-mono text-[10.5px] tracking-[0.04em] text-[var(--color-ink-3)]">
          USDC Wrapped
        </span>
      </div>
      <div className="mt-4 space-y-1.5 border-t border-[var(--color-border)] pt-3">
        <Row label="Official Pairs" value="Indexed from Zama registry" />
        <Row label="Total TVS" value={`${TVS_BREAKDOWN.total.toLocaleString()} USDC`} />
        <a
          href={addressUrl(CONTRACTS.AnimaRegistryRouter)}
          target="_blank"
          rel="noreferrer"
          className="font-mono flex items-baseline justify-between gap-3 pt-1 text-[11.5px] tracking-[0.04em] text-[var(--color-ink-2)] transition hover:text-[var(--color-ink)]"
        >
          <span>Registry Router</span>
          <span>{truncate(CONTRACTS.AnimaRegistryRouter, 8, 6)} ↗</span>
        </a>
      </div>
    </PaneShell>
  )
}

function PaneShell({
  label,
  symbol,
  children,
}: {
  label: string
  symbol: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-[12px] border border-[var(--color-border)] bg-[var(--color-paper)] p-5 shadow-[0_24px_60px_-44px_rgba(50,35,18,0.4)]"
    >
      <div className="font-mono mb-3 flex items-center justify-between text-[10.5px] tracking-[0.04em] text-[var(--color-ink-2)]">
        <span>{label}</span>
        <span className="font-display text-[18px] text-[var(--color-ink)]">{symbol}</span>
      </div>
      {children}
    </motion.div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="font-mono flex items-baseline justify-between gap-3 text-[11.5px]">
      <span className="text-[var(--color-ink-3)] tracking-[0.04em]">{label}</span>
      <span className="text-[var(--color-ink)]">{value}</span>
    </div>
  )
}

function Refresh() {
  const [now, setNow] = useState(',:,:,')
  useEffect(() => {
    const tick = () => {
      const d = new Date()
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      const ss = String(d.getSeconds()).padStart(2, '0')
      setNow(`${hh}:${mm}:${ss}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="font-mono mt-4 flex items-center justify-between text-[10px] tracking-[0.04em] text-[var(--color-ink-3)]">
      <span>Last Refresh</span>
      <span>{now}</span>
    </div>
  )
}
