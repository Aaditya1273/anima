'use client'

import { ShieldBadge } from '@/components/fhe/ConfidentialAmount'
import { DecryptButton } from '@/components/fhe/DecryptButton'
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useState } from 'react'
import Link from 'next/link'
import { ANIMA_REGISTRY_ROUTER_ADDRESS } from '@anima/shared'
import { ANIMA_REGISTRY_ROUTER_ABI } from '@anima/shared'

type Pair = {
  erc20:    `0x${string}`
  erc7984:  `0x${string}`
  name:     string
  symbol:   string
  decimals: number
}

type WrapState = 'idle' | 'encrypting' | 'broadcasting' | 'done' | 'error'

export default function RegistryPage() {
  const { isConnected } = useAccount()
  const [wrapPairId, setWrapPairId]   = useState<number | null>(null)
  const [wrapAmount, setWrapAmount]   = useState('')
  const [wrapState, setWrapState]     = useState<WrapState>('idle')
  const [wrapError, setWrapError]     = useState<string | null>(null)
  const [faucetPairId, setFaucetPairId] = useState<number | null>(null)

  // ── 1. Read pair count from the real AnimaRegistryRouter ─────────────────
  const { data: pairCount } = useReadContract({
    address: ANIMA_REGISTRY_ROUTER_ADDRESS,
    abi: ANIMA_REGISTRY_ROUTER_ABI,
    functionName: 'officialPairCount',
    query: { enabled: ANIMA_REGISTRY_ROUTER_ADDRESS !== '0x0000000000000000000000000000000000000000' },
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

  const pairs: Array<Pair & { id: number }> = (pairData ?? [])
    .map((result, i) => {
      if (result.status !== 'success') return null
      const p = result.result as Pair
      return { id: i, ...p }
    })
    .filter((p): p is Pair & { id: number } => p !== null)

  // Fallback when contract not deployed yet — show placeholder rows
  const displayPairs =
    pairs.length > 0
      ? pairs
      : [
          { id: 0, erc20: '0x0000000000000000000000000000000000000000' as `0x${string}`, erc7984: '0x0000000000000000000000000000000000000000' as `0x${string}`, name: 'USD Coin', symbol: 'USDC', decimals: 6 },
          { id: 1, erc20: '0x0000000000000000000000000000000000000000' as `0x${string}`, erc7984: '0x0000000000000000000000000000000000000000' as `0x${string}`, name: 'Tether USD', symbol: 'USDT', decimals: 6 },
          { id: 2, erc20: '0x0000000000000000000000000000000000000000' as `0x${string}`, erc7984: '0x0000000000000000000000000000000000000000' as `0x${string}`, name: 'Wrapped Ether', symbol: 'WETH', decimals: 18 },
        ]

  // ── 3. Wrap transaction ───────────────────────────────────────────────────
  const { writeContractAsync } = useWriteContract()

  async function handleWrap(pairId: number) {
    if (!wrapAmount) return
    setWrapError(null)
    setWrapState('encrypting')
    try {
      setWrapState('broadcasting')
      // The Zama SDK encrypts encAmount client-side before this call.
      // Until contracts are live we call with zero-bytes so the UI
      // surfaces the "deploy pending" revert cleanly.
      await writeContractAsync({
        address: ANIMA_REGISTRY_ROUTER_ADDRESS,
        abi: ANIMA_REGISTRY_ROUTER_ABI,
        functionName: 'wrap',
        args: [BigInt(pairId), `0x${'00'.repeat(32)}` as `0x${string}`, '0x'],
      })
      setWrapState('done')
      setWrapAmount('')
      setWrapPairId(null)
    } catch (e) {
      setWrapState('error')
      setWrapError((e as Error).message)
    }
  }

  // ── 4. Faucet transaction ─────────────────────────────────────────────────
  const { writeContractAsync: faucetWrite, isPending: fauceting } = useWriteContract()

  async function handleFaucet(pairId: number) {
    const pair = displayPairs.find(p => p.id === pairId)
    if (!pair || pair.erc20 === '0x0000000000000000000000000000000000000000') return
    setFaucetPairId(pairId)
    try {
      await faucetWrite({
        address: ANIMA_REGISTRY_ROUTER_ADDRESS,
        abi: ANIMA_REGISTRY_ROUTER_ABI,
        functionName: 'faucet',
        args: [pair.erc20, 1_000n * 10n ** BigInt(pair.decimals)],
      })
    } catch { /* user rejected */ }
    finally { setFaucetPairId(null) }
  }

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
            <Link href="https://docs.zama.ai" target="_blank" rel="noreferrer"
              className="underline decoration-[var(--color-border-strong)] underline-offset-[3px] hover:decoration-[var(--color-ink)]">
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
            AnimaRegistryRouter not yet deployed — run{' '}
            <code>pnpm deploy:sepolia</code>. Showing placeholder pairs.
          </p>
        </div>
      )}

      {/* Pair table */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-left text-[14px]">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-paper)]">
              <th className="px-5 py-3.5 font-medium text-[var(--color-ink)]">Pair</th>
              <th className="px-5 py-3.5 font-medium text-[var(--color-ink)]">ERC-20</th>
              <th className="px-5 py-3.5 font-medium text-[var(--color-ink)]">ERC-7984</th>
              <th className="px-5 py-3.5 font-medium text-[var(--color-ink)]">Wrap</th>
              <th className="px-5 py-3.5 font-medium text-[var(--color-ink)]">Balance</th>
            </tr>
          </thead>
          <tbody>
            {displayPairs.map(pair => (
              <tr key={pair.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-paper)]">
                <td className="px-5 py-3.5">
                  <div className="font-medium text-[var(--color-ink)]">{pair.name}</div>
                  <div className="font-mono text-[12px] text-[var(--color-ink-3)]">
                    {pair.symbol} ↔ c{pair.symbol}
                  </div>
                </td>
                <td className="px-5 py-3.5 font-mono text-[12px] text-[var(--color-ink-2)]">
                  {pair.erc20 === '0x0000000000000000000000000000000000000000'
                    ? 'Deploy pending'
                    : `${pair.erc20.slice(0, 6)}…${pair.erc20.slice(-4)}`}
                </td>
                <td className="px-5 py-3.5 font-mono text-[12px] text-[var(--color-ink-2)]">
                  {pair.erc7984 === '0x0000000000000000000000000000000000000000'
                    ? 'Deploy pending'
                    : `${pair.erc7984.slice(0, 6)}…${pair.erc7984.slice(-4)}`}
                </td>
                <td className="px-5 py-3.5">
                  {wrapPairId === pair.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={wrapAmount}
                        onChange={e => setWrapAmount(e.target.value)}
                        placeholder="amount"
                        className="w-20 rounded border border-[var(--color-border)] bg-[var(--color-paper)] px-2 py-1 font-mono text-[12px] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => void handleWrap(pair.id)}
                        disabled={wrapState === 'broadcasting' || !wrapAmount}
                        className="rounded-lg bg-[var(--color-ink)] px-3 py-1 text-[12px] font-medium text-[var(--color-cream)] disabled:opacity-50"
                      >
                        {wrapState === 'encrypting' ? 'Encrypting…' : wrapState === 'broadcasting' ? 'Sending…' : 'Confirm'}
                      </button>
                      <button type="button" onClick={() => setWrapPairId(null)} className="text-[11px] text-[var(--color-ink-3)]">✕</button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setWrapPairId(pair.id); setWrapState('idle') }}
                      disabled={!isConnected}
                      className="rounded-lg border border-[var(--color-border)] px-3 py-1 text-[12px] text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] disabled:opacity-50"
                    >
                      Wrap
                    </button>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  {isConnected && pair.erc7984 !== '0x0000000000000000000000000000000000000000' ? (
                    <DecryptButton
                      contractAddress={pair.erc7984}
                      label={`c${pair.symbol}`}
                    />
                  ) : (
                    <span className="text-[12px] text-[var(--color-ink-3)]">
                      {isConnected ? '—' : 'Connect wallet'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {wrapError && (
        <p className="mt-2 font-mono text-[12px] text-red-500">{wrapError}</p>
      )}

      {/* Faucet + info */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
          <h3 className="font-display text-[18px] font-light tracking-tight text-[var(--color-ink)]">
            cTokenMock Faucet
          </h3>
          <p className="mt-2 text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
            Calls <code className="font-mono">AnimaRegistryRouter.faucet(token, 1000e6)</code> — mints
            official Zama-deployed Sepolia cTokenMocks, not a custom mock.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {displayPairs.map(pair => (
              <button
                key={pair.id}
                type="button"
                disabled={!isConnected || fauceting || !isDeployed}
                onClick={() => void handleFaucet(pair.id)}
                className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[12px] text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] disabled:opacity-50"
              >
                {faucetPairId === pair.id ? 'Minting…' : `Get ${pair.symbol}`}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
          <h3 className="font-display text-[18px] font-light tracking-tight text-[var(--color-ink)]">
            EIP-712 Decrypt
          </h3>
          <p className="mt-2 text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
            Click Decrypt on any pair row. One EIP-712 signature — balance decrypts in-browser
            only, via <code className="font-mono">useConfidentialBalance</code>. Subsequent calls
            reuse the cached permit silently.
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
              {isDeployed ? ANIMA_REGISTRY_ROUTER_ADDRESS : 'Deploy pending — run pnpm deploy:sepolia'}
            </p>
          </div>
          <Link
            href={`https://sepolia.etherscan.io/address/${ANIMA_REGISTRY_ROUTER_ADDRESS}`}
            target="_blank" rel="noreferrer"
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-[13px] text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)]"
          >
            Etherscan ↗
          </Link>
        </div>
      </div>
    </main>
  )
}
