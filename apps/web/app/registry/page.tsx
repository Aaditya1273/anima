'use client'

import { ShieldBadge } from '@/components/fhe/ConfidentialAmount'
import { FaucetPanel } from '@/components/registry/FaucetPanel'
import { PairTable, type RegistryPair } from '@/components/registry/PairTable'
import { ANIMA_REGISTRY_ROUTER_ADDRESS } from '@anima/shared'
import { ANIMA_REGISTRY_ROUTER_ABI } from '@anima/shared'
import Link from 'next/link'
import { useReadContract, useReadContracts } from 'wagmi'

type Pair = {
  erc20: `0x${string}`
  erc7984: `0x${string}`
  name: string
  symbol: string
  decimals: number
}

export default function RegistryPage() {
  // ── 1. Read pair count from the real AnimaRegistryRouter ─────────────────
  const { data: pairCount } = useReadContract({
    address: ANIMA_REGISTRY_ROUTER_ADDRESS,
    abi: ANIMA_REGISTRY_ROUTER_ABI,
    functionName: 'officialPairCount',
    query: {
      enabled: ANIMA_REGISTRY_ROUTER_ADDRESS !== '0x0000000000000000000000000000000000000000',
    },
  })

  const count = Number(pairCount ?? 0)

  // ── 2. Read each pair in a single multicall ───────────────────────────────
  const { data: pairData } = useReadContracts({
    contracts: Array.from({ length: count }, (_, i) => ({
      address: ANIMA_REGISTRY_ROUTER_ADDRESS,
      abi: ANIMA_REGISTRY_ROUTER_ABI,
      functionName: 'getPair' as const,
      args: [BigInt(i)] as const,
    })),
    query: { enabled: count > 0 },
  })

  const pairs: RegistryPair[] = (pairData ?? [])
    .map((result, i) => {
      if (result.status !== 'success') return null
      const p = result.result as Pair
      return { id: i, ...p }
    })
    .filter((p): p is RegistryPair => p !== null)

  const isDeployed = ANIMA_REGISTRY_ROUTER_ADDRESS !== '0x0000000000000000000000000000000000000000'

  return (
    <main className="mx-auto max-w-5xl px-6 pb-32 pt-28">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="kicker">BOUNTY TRACK</span>
            <ShieldBadge />
          </div>
          <h1
            className="mt-3 font-display text-[clamp(34px,4vw,56px)] font-light leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]"
            style={{ fontVariationSettings: '"opsz" 96, "SOFT" 30, "WONK" 0' }}
          >
            Wrapper Registry
          </h1>
          <p className="mt-3 max-w-[56ch] text-[15.5px] leading-[1.65] text-[var(--color-ink-2)]">
            Surfaces every official ERC-20 ↔ ERC-7984 pair from the{' '}
            <Link
              href="https://docs.zama.ai"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-[var(--color-border-strong)] underline-offset-[3px] hover:decoration-[var(--color-ink)]"
            >
              Zama Wrappers Registry
            </Link>{' '}
            on Sepolia. No duplicate registry — reads{' '}
            <code className="font-mono text-[13px]">officialPairCount()</code> live.
          </p>
        </div>
        <div className="hidden shrink-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-3 sm:block">
          <div className="font-mono text-[11px] text-[var(--color-ink-3)]">Pairs indexed</div>
          <div className="mt-0.5 font-mono text-[13px] text-[var(--color-ink)]">
            {isDeployed ? (count > 0 ? count : '…') : 'Deploy pending'}
          </div>
        </div>
      </div>

      {!isDeployed && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3">
          <p className="font-mono text-[12px] text-amber-700">
            AnimaRegistryRouter not yet deployed — run <code>pnpm deploy:sepolia</code>. No pairs to
            display.
          </p>
        </div>
      )}

      {/* Pair table — extracted component */}
      <div className="mt-8">
        <PairTable pairs={pairs} />
      </div>

      {/* Faucet + info */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FaucetPanel pairs={pairs} isDeployed={isDeployed} />
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
          <h3 className="font-display text-[18px] font-light tracking-tight text-[var(--color-ink)]">
            EIP-712 Decrypt
          </h3>
          <p className="mt-2 text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
            Click Decrypt on any pair row. One EIP-712 signature — balance decrypts in-browser only,
            via <code className="font-mono">useConfidentialBalance</code>. Subsequent calls reuse
            the cached permit silently.
          </p>
        </div>
      </div>

      {/* Contract */}
      <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-[16px] font-medium text-[var(--color-ink)]">
              AnimaRegistryRouter
            </h3>
            <p className="mt-0.5 font-mono text-[12px] text-[var(--color-ink-3)]">
              {isDeployed
                ? ANIMA_REGISTRY_ROUTER_ADDRESS
                : 'Deploy pending — run pnpm deploy:sepolia'}
            </p>
          </div>
          <Link
            href={`https://sepolia.etherscan.io/address/${ANIMA_REGISTRY_ROUTER_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-[13px] text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)]"
          >
            Etherscan ↗
          </Link>
        </div>
      </div>
    </main>
  )
}
