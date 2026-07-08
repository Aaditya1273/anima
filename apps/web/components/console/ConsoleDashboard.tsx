'use client'

import { addressUrl, truncate, txUrl } from '@/lib/chainscan'
import {
  CONTRACTS_META,
  DISPERSE_STATS,
  PAYROLL_STATS,
  SNAPSHOT_TAKEN_AT_UTC,
  TVS_BREAKDOWN,
} from '@/lib/snapshot'
import { motion } from 'framer-motion'
import Link from 'next/link'

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const

export function ConsoleDashboard() {
  return (
    <div className="grid gap-16 pb-16">
      {/* TVS Hero */}
      <TvsHero />

      {/* Quick nav cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <NavCard
          title="Payroll"
          desc="Shield salaries, earn yield, manage roles"
          href="/payroll"
          stat={PAYROLL_STATS.totalValueShielded}
          statLabel="total shielded"
          delay={0}
        />
        <NavCard
          title="Registry"
          desc="Wrap/unwrap ERC-7984 tokens"
          href="/registry"
          stat={`${Object.keys(CONTRACTS_META).length} contracts`}
          statLabel="on Sepolia"
          delay={0.06}
        />
        <NavCard
          title="Disperse"
          desc="Confidential airdrops with vesting"
          href="/disperse"
          stat={`${DISPERSE_STATS.distributionsCreated} distributions`}
          statLabel={`${DISPERSE_STATS.totalRecipients} recipients`}
          delay={0.12}
        />
      </div>

      {/* Contracts table */}
      <ContractsSection />

      {/* Stats breakdown */}
      <div className="grid gap-12 md:grid-cols-2">
        <PayrollStats />
        <DisperseStats />
      </div>

      {/* Snapshot timestamp */}
      <p className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
        Snapshot · {SNAPSHOT_TAKEN_AT_UTC}
      </p>
    </div>
  )
}

function TvsHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: REVEAL_EASE }}
      className="grid gap-6"
    >
      <div className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
        Total Value Shielded
      </div>
      <div
        className="font-display font-light leading-[0.95] tracking-tight text-[var(--color-ink)]"
        style={{
          fontSize: 'clamp(52px, 8vw, 110px)',
          fontVariationSettings: '"opsz" 96, "SOFT" 30, "WONK" 0',
        }}
      >
        {new Intl.NumberFormat('en-US').format(TVS_BREAKDOWN.total)}
        <span className="ml-3 align-baseline font-mono text-[0.2em] tracking-[0.06em] text-[var(--color-ink-2)]">
          USDC
        </span>
      </div>
      <div className="flex flex-wrap gap-6">
        {(
          [
            { key: 'payroll', label: 'Payroll' },
            { key: 'disperse', label: 'Disperse' },
            { key: 'registry', label: 'Registry' },
          ] as const
        ).map(item => {
          const b = TVS_BREAKDOWN[item.key]
          return (
            <div key={item.key} className="grid gap-0.5">
              <span className="font-mono text-[13px] text-[var(--color-ink-2)]">{b.label}</span>
              <span className="font-mono text-[12px] text-[var(--color-ink-3)]">{b.description}</span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

function NavCard({
  title,
  desc,
  href,
  stat,
  statLabel,
  delay,
}: {
  title: string
  desc: string
  href: string
  stat: string
  statLabel: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, delay, ease: REVEAL_EASE }}
    >
      <Link
        href={href}
        className="group grid gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6 transition-colors hover:border-[var(--color-ink-2)]"
      >
        <div>
          <h2 className="font-display text-[20px] font-light leading-tight tracking-tight text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-ink-2)]">
            {title}
          </h2>
          <p className="mt-1 text-[13.5px] leading-snug text-[var(--color-ink-3)]">{desc}</p>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-[var(--color-border)] pt-3">
          <span className="font-mono text-[12px] text-[var(--color-ink)]">{stat}</span>
          <span className="font-mono text-[11px] text-[var(--color-ink-3)]">{statLabel}</span>
        </div>
      </Link>
    </motion.div>
  )
}

function ContractsSection() {
  return (
    <section className="grid gap-5">
      <div className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
        Deployed Contracts
      </div>
      <div className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)]">
        {(Object.values(CONTRACTS_META) as Array<{
          name: string
          address: string
          label: string
          deployedAt: string
          gasUsed: string
        }>).map((meta, i) => (
          <motion.div
            key={meta.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.06, ease: REVEAL_EASE }}
            className="grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-5 sm:px-8"
          >
            <div className="grid gap-1">
              <Link
                href={addressUrl(meta.address)}
                target="_blank"
                rel="noreferrer"
                className="font-display text-[16px] font-light tracking-tight text-[var(--color-ink)] transition-colors hover:text-[var(--color-ink-2)]"
              >
                {meta.name} <span aria-hidden>↗</span>
              </Link>
              <p className="font-mono text-[12px] text-[var(--color-ink-3)]">
                {truncate(meta.address, 8, 6)}
              </p>
              <p className="mt-1 text-[12px] leading-snug text-[var(--color-ink-3)]">
                {meta.label} · Gas ~{meta.gasUsed}
              </p>
            </div>
            <span className="font-mono text-[11px] text-[var(--color-ink-3)]">
              {new Date(meta.deployedAt).toLocaleDateString()}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function PayrollStats() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35, ease: REVEAL_EASE }}
      className="grid gap-4"
    >
      <div className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
        Payroll
      </div>
      <div className="grid gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-6 py-5 sm:px-8">
        <StatRow label="Salaries paid" value={String(PAYROLL_STATS.totalSalariesPaid)} />
        <StatRow label="Active employees" value={String(PAYROLL_STATS.activeEmployees)} />
        <StatRow label="Value shielded" value={PAYROLL_STATS.totalValueShielded} />
        <StatRow label="Yield deposits" value={String(PAYROLL_STATS.pendingYieldDeposits)} />
        <StatRow label="Morpho vault" value={PAYROLL_STATS.morphoVault} />
        <Link
          href={txUrl(PAYROLL_STATS.lastSalaryTx)}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1.5 font-mono text-[12px] text-[var(--color-ink-3)] transition-colors hover:text-[var(--color-ink)]"
        >
          Last tx ↗
        </Link>
      </div>
    </motion.section>
  )
}

function DisperseStats() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: REVEAL_EASE }}
      className="grid gap-4"
    >
      <div className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
        Disperse
      </div>
      <div className="grid gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-6 py-5 sm:px-8">
        <StatRow label="Distributions" value={String(DISPERSE_STATS.distributionsCreated)} />
        <StatRow label="Total recipients" value={String(DISPERSE_STATS.totalRecipients)} />
        <StatRow label="Value distributed" value={DISPERSE_STATS.totalValueDistributed} />
        <StatRow label="Active" value={String(DISPERSE_STATS.activeDistributions)} />
        <StatRow label="Last ID" value={`#${DISPERSE_STATS.lastDistributionId}`} />
        <Link
          href={txUrl(DISPERSE_STATS.lastDistributionTx)}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1.5 font-mono text-[12px] text-[var(--color-ink-3)] transition-colors hover:text-[var(--color-ink)]"
        >
          Last distribution tx ↗
        </Link>
      </div>
    </motion.section>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="font-mono text-[12.5px] text-[var(--color-ink-3)]">{label}</span>
      <span className="font-mono text-[13px] text-[var(--color-ink)]">{value}</span>
    </div>
  )
}
