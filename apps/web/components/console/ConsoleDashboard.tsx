'use client'

import { CONTRACTS, addressUrl, truncate } from '@/lib/chainscan'
import { ANIMA_DISPERSE_ABI, ANIMA_PAYROLL_ABI, ANIMA_REGISTRY_ROUTER_ABI } from '@anima/shared'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useReadContract } from 'wagmi'
import { TvsSection } from './TvsSection'

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const

const CONTRACT_LIST = [
  {
    name: 'AnimaPayroll',
    address: CONTRACTS.AnimaPayroll,
    label: 'Confidential Payroll Vault',
    abi: ANIMA_PAYROLL_ABI,
    readLabel: 'Protocol ID',
  },
  {
    name: 'AnimaRegistryRouter',
    address: CONTRACTS.AnimaRegistryRouter,
    label: 'Official Wrapper Registry Router',
    abi: ANIMA_REGISTRY_ROUTER_ABI,
    readLabel: 'Official pairs',
  },
  {
    name: 'AnimaDisperse',
    address: CONTRACTS.AnimaDisperse,
    label: 'Confidential Distribution Engine',
    abi: ANIMA_DISPERSE_ABI,
    readLabel: 'Distributions',
  },
] as const

export function ConsoleDashboard() {
  // ── Live on-chain reads via Sepolia public client ──────────────────────────
  const { data: protocolId } = useReadContract({
    address: CONTRACTS.AnimaPayroll,
    abi: ANIMA_PAYROLL_ABI,
    functionName: 'confidentialProtocolId',
    query: { refetchInterval: 30_000 },
  })

  const { data: pairCount } = useReadContract({
    address: CONTRACTS.AnimaRegistryRouter,
    abi: ANIMA_REGISTRY_ROUTER_ABI,
    functionName: 'officialPairCount',
    query: { refetchInterval: 30_000 },
  })

  const { data: distCount } = useReadContract({
    address: CONTRACTS.AnimaDisperse,
    abi: ANIMA_DISPERSE_ABI,
    functionName: 'distributionCount',
    query: { refetchInterval: 30_000 },
  })

  const chainData = {
    protocolId: protocolId !== undefined ? Number(protocolId) : null,
    pairCount: pairCount !== undefined ? Number(pairCount) : null,
    distCount: distCount !== undefined ? Number(distCount) : null,
  }

  const anyDataLoaded = chainData.protocolId !== null

  return (
    <div className="grid gap-16 pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: REVEAL_EASE }}
        className="grid gap-4"
      >
        <h1
          className="font-display font-light leading-[0.95] tracking-tight text-[var(--color-ink)]"
          style={{
            fontSize: 'clamp(38px, 4.6vw, 68px)',
            fontVariationSettings: '"opsz" 96, "SOFT" 30, "WONK" 0',
          }}
        >
          Console
        </h1>
        <p className="max-w-[50ch] text-[15px] leading-relaxed text-[var(--color-ink-2)]">
          Three contracts live on Ethereum Sepolia. Data below is read directly from the chain in
          real time.
        </p>
      </motion.div>

      {/* Live metrics row — read from chain */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: REVEAL_EASE }}
        className="grid gap-4 sm:grid-cols-3"
      >
        <MetricCard
          label="Protocol"
          value={chainData.protocolId !== null ? `Sepolia · #${chainData.protocolId}` : '…'}
          loaded={anyDataLoaded}
        />
        <MetricCard
          label="Official Pairs"
          value={chainData.pairCount !== null ? String(chainData.pairCount) : '…'}
          loaded={anyDataLoaded}
        />
        <MetricCard
          label="Distributions"
          value={chainData.distCount !== null ? String(chainData.distCount) : '…'}
          loaded={anyDataLoaded}
        />
      </motion.div>

      {/* TVS dashboard */}
      <TvsSection />

      {/* Quick nav cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <NavCard
          title="Payroll"
          desc="Shield salaries and manage roles"
          href="/payroll"
          delay={0}
        />
        <NavCard
          title="Registry"
          desc="Wrap and unwrap ERC-7984 tokens"
          href="/registry"
          delay={0.06}
        />
        <NavCard
          title="Disperse"
          desc="Create confidential distributions"
          href="/disperse"
          delay={0.12}
        />
      </div>

      {/* Contracts table — real on-chain data only */}
      <section className="grid gap-5">
        <div className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
          Deployed Contracts
        </div>
        <div className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)]">
          {CONTRACT_LIST.map((meta, i) => {
            const liveValue =
              meta.name === 'AnimaPayroll'
                ? chainData.protocolId !== null
                  ? `#${chainData.protocolId}`
                  : null
                : meta.name === 'AnimaRegistryRouter'
                  ? chainData.pairCount !== null
                    ? `${chainData.pairCount} pairs`
                    : null
                  : meta.name === 'AnimaDisperse'
                    ? chainData.distCount !== null
                      ? `${chainData.distCount} dist.`
                      : null
                    : null

            return (
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
                    {meta.label}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {liveValue !== null && anyDataLoaded ? (
                    <span className="inline-flex items-center gap-1.5 font-mono text-[12px] text-[var(--color-ink)]">
                      <span className="block h-1.5 w-1.5 rounded-full bg-green-500" />
                      {liveValue}
                    </span>
                  ) : null}
                  <Link
                    href={addressUrl(meta.address)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[11px] text-[var(--color-ink-3)] transition-colors hover:text-[var(--color-ink)]"
                  >
                    Etherscan ↗
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Footer nav */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="border-t border-[var(--color-border)] pt-8"
      >
        <Link
          href="/"
          className="font-wordmark text-[20px] leading-none tracking-[-0.01em] text-[var(--color-ink)] transition-opacity hover:opacity-70"
        >
          anima
        </Link>
      </motion.div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  loaded,
}: {
  label: string
  value: string
  loaded: boolean
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-4">
      <div className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
        {label}
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        {loaded ? (
          <span className="block h-1.5 w-1.5 rounded-full bg-green-500" />
        ) : (
          <span className="block h-1.5 w-1.5 rounded-full bg-[var(--color-ink-3)]" />
        )}
        <span className="font-display text-[22px] font-light leading-none tracking-tight text-[var(--color-ink)]">
          {value}
        </span>
      </div>
    </div>
  )
}

function NavCard({
  title,
  desc,
  href,
  delay,
}: {
  title: string
  desc: string
  href: string
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
        <div className="flex items-center gap-3 border-t border-[var(--color-border)] pt-3">
          <span className="font-mono text-[12px] text-[var(--color-ink)]">Open →</span>
        </div>
      </Link>
    </motion.div>
  )
}
