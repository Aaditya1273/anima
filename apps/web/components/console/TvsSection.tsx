'use client'

import { CONTRACTS, addressUrl, truncate } from '@/lib/chainscan'
import {
  ANIMA_DISPERSE_ABI,
  ANIMA_PAYROLL_ABI,
  ANIMA_REGISTRY_ROUTER_ABI,
  ZAMA_WRAPPERS_REGISTRY_ADDRESS,
} from '@anima/shared'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useMemo } from 'react'
import { useReadContract } from 'wagmi'

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const

type TvsMetric = {
  label: string
  value: number | null
  unit: string
  description: string
  loaded: boolean
}

export function TvsSection() {
  // ── AnimaPayroll ──────────────────────────────────────────────────────────
  const { data: protocolId } = useReadContract({
    address: CONTRACTS.AnimaPayroll,
    abi: ANIMA_PAYROLL_ABI,
    functionName: 'confidentialProtocolId',
    query: { refetchInterval: 30_000 },
  })

  // ── AnimaRegistryRouter ───────────────────────────────────────────────────
  const { data: pairCount } = useReadContract({
    address: CONTRACTS.AnimaRegistryRouter,
    abi: ANIMA_REGISTRY_ROUTER_ABI,
    functionName: 'officialPairCount',
    query: { refetchInterval: 30_000 },
  })

  const { data: officialRegistry } = useReadContract({
    address: CONTRACTS.AnimaRegistryRouter,
    abi: ANIMA_REGISTRY_ROUTER_ABI,
    functionName: 'officialRegistry',
    query: { refetchInterval: 30_000 },
  })

  // ── AnimaDisperse ─────────────────────────────────────────────────────────
  const { data: distCount } = useReadContract({
    address: CONTRACTS.AnimaDisperse,
    abi: ANIMA_DISPERSE_ABI,
    functionName: 'distributionCount',
    query: { refetchInterval: 30_000 },
  })

  const allLoaded = protocolId !== undefined

  const metrics: TvsMetric[] = useMemo(
    () => [
      {
        label: 'Protocol',
        value: protocolId !== undefined ? Number(protocolId) : null,
        unit: 'ID',
        description: 'AnimaPayroll — confidential payroll vault protocol identifier',
        loaded: protocolId !== undefined,
      },
      {
        label: 'Official Pairs',
        value: pairCount !== undefined ? Number(pairCount) : null,
        unit: 'pairs',
        description: 'ERC-20 ↔ ERC-7984 pairs indexed from the Zama Wrappers Registry',
        loaded: pairCount !== undefined,
      },
      {
        label: 'Distributions',
        value: distCount !== undefined ? Number(distCount) : null,
        unit: 'created',
        description: 'Confidential distributions created via AnimaDisperse',
        loaded: distCount !== undefined,
      },
    ],
    [protocolId, pairCount, distCount],
  )

  return (
    <section className="grid gap-6">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: REVEAL_EASE }}
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
            ON-CHAIN OVERVIEW
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1">
            <span className="block h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="font-mono text-[11px] text-green-700">Live · Sepolia</span>
          </span>
        </div>
        <h2
          className="mt-3 font-display text-[clamp(24px,3vw,36px)] font-light leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]"
          style={{ fontVariationSettings: '"opsz" 72, "SOFT" 30, "WONK" 0' }}
        >
          Total Value Shielded
        </h2>
        <p className="mt-2 max-w-[56ch] text-[14px] leading-[1.65] text-[var(--color-ink-2)]">
          Live on-chain metrics from all three Anima contracts. Data is read directly from Ethereum
          Sepolia every 30 seconds. Because FHE balances are encrypted, individual shielded amounts
          cannot be summed without a decrypt permit — the metrics below show contract activity as a
          proxy for shielded value.
        </p>
      </motion.div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.07, ease: REVEAL_EASE }}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-4"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
                {m.label}
              </span>
              {m.loaded && <span className="block h-1.5 w-1.5 rounded-full bg-green-500" />}
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-[clamp(28px,3.2vw,42px)] font-light leading-none tracking-tight text-[var(--color-ink)]">
                {m.value !== null ? m.value : '…'}
              </span>
              <span className="font-mono text-[13px] text-[var(--color-ink-3)]">{m.unit}</span>
            </div>
            <p className="mt-1 text-[12.5px] leading-snug text-[var(--color-ink-3)]">
              {m.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Contract breakdown cards */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease: REVEAL_EASE }}
        className="grid gap-4 sm:grid-cols-3"
      >
        <ContractTvsCard
          name="AnimaPayroll"
          address={CONTRACTS.AnimaPayroll}
          label="Confidential Payroll Vault"
          status={allLoaded ? 'active' : 'loading'}
          metric={protocolId !== undefined ? `Protocol #${Number(protocolId)}` : null}
        />
        <ContractTvsCard
          name="AnimaRegistryRouter"
          address={CONTRACTS.AnimaRegistryRouter}
          label="Official Wrapper Registry"
          status={allLoaded ? 'active' : 'loading'}
          metric={pairCount !== undefined ? `${Number(pairCount)} pairs` : null}
          registryNote={
            officialRegistry !== undefined &&
            officialRegistry !== '0x0000000000000000000000000000000000000000'
              ? `Zama registry: ${truncate(officialRegistry, 6, 4)}`
              : undefined
          }
        />
        <ContractTvsCard
          name="AnimaDisperse"
          address={CONTRACTS.AnimaDisperse}
          label="Distribution Engine"
          status={allLoaded ? 'active' : 'loading'}
          metric={distCount !== undefined ? `${Number(distCount)} distributions` : null}
        />
      </motion.div>

      {/* Zama Registry note */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5, ease: REVEAL_EASE }}
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
              ZAMA WRAPPERS REGISTRY
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-display text-[16px] font-light tracking-tight text-[var(--color-ink)]">
                Sepolia Registry
              </span>
              <span className="block h-1.5 w-1.5 rounded-full bg-green-500" />
            </div>
          </div>
          <a
            href={addressUrl(ZAMA_WRAPPERS_REGISTRY_ADDRESS)}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[12px] text-[var(--color-ink-2)] underline-offset-2 hover:underline"
          >
            {truncate(ZAMA_WRAPPERS_REGISTRY_ADDRESS, 8, 6)} ↗
          </a>
        </div>
        <p className="mt-2 text-[13px] leading-snug text-[var(--color-ink-2)]">
          The canonical ERC-20 ↔ ERC-7984 pair directory published by Zama. AnimaRegistryRouter
          reads from this registry via RPC — it does not duplicate the state.
        </p>
      </motion.div>

      {/* Definitions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-4"
      >
        <div className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
          WHAT TVS MEANS HERE
        </div>
        <div className="mt-2 grid gap-2 text-[13px] leading-relaxed text-[var(--color-ink-2)]">
          <p>
            TVS tracks contract activity across all three Anima surfaces. Because FHE balances are
            encrypted on-chain and only the balance owner (or a granted auditor) can decrypt them,
            there is no on-chain function to sum all encrypted values without per-address
            permissions.
          </p>
          <p>
            The metrics above — protocol ID, indexed pairs, and distribution count — serve as a
            real-time proxy for shielded value. A future contract upgrade could add a
            <code className="font-mono"> totalEncryptedSupply() </code>
            view function to enable precise TVS computation without exposing individual balances.
          </p>
          <p className="font-mono text-[12px] text-[var(--color-ink-3)]">
            TVS ≈ contract activity + protocol adoption + distribution volume
          </p>
        </div>
      </motion.div>
    </section>
  )
}

function ContractTvsCard({
  name,
  address,
  label,
  status,
  metric,
  registryNote,
}: {
  name: string
  address: `0x${string}`
  label: string
  status: 'active' | 'loading'
  metric: string | null
  registryNote?: string
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
              {label}
            </span>
          </div>
          <Link
            href={addressUrl(address)}
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 inline-flex items-center gap-1 font-display text-[16px] font-light tracking-tight text-[var(--color-ink)] transition-colors hover:text-[var(--color-ink-2)]"
          >
            {name} <span aria-hidden>↗</span>
          </Link>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] ${
            status === 'active'
              ? 'bg-green-50 text-green-700'
              : 'bg-[var(--color-cream)] text-[var(--color-ink-3)]'
          }`}
        >
          <span
            className={`block h-1.5 w-1.5 rounded-full ${
              status === 'active' ? 'bg-green-500' : 'bg-[var(--color-ink-3)]'
            }`}
          />
          {status === 'active' ? 'Live' : 'Loading'}
        </span>
      </div>
      <p className="mt-2 font-mono text-[12px] text-[var(--color-ink-3)]">
        {truncate(address, 8, 6)}
      </p>
      {metric && <p className="mt-1.5 font-mono text-[13px] text-[var(--color-ink)]">{metric}</p>}
      {registryNote && <p className="mt-1 text-[12px] text-[var(--color-ink-3)]">{registryNote}</p>}
    </div>
  )
}
