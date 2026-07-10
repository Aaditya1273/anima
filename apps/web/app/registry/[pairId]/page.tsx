'use client'

import { ShieldBadge } from '@/components/fhe/ConfidentialAmount'
import { DecryptButton } from '@/components/fhe/DecryptButton'
import { ANIMA_REGISTRY_ROUTER_ADDRESS } from '@anima/shared'
import { ANIMA_REGISTRY_ROUTER_ABI } from '@anima/shared'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

type Pair = {
  erc20: `0x${string}`
  erc7984: `0x${string}`
  name: string
  symbol: string
  decimals: number
}

export default function PairDetailPage() {
  const params = useParams()
  const pairId = params.pairId as string
  const pairIdBigInt = useMemo(() => {
    try {
      return BigInt(pairId)
    } catch {
      return null
    }
  }, [pairId])

  const { address, isConnected } = useAccount()

  // ── Form state ──────────────────────────────────────────────────────────────
  const [wrapAmount, setWrapAmount] = useState('')
  const [unwrapAmount, setUnwrapAmount] = useState('')
  const [txError, setTxError] = useState<string | null>(null)
  const [actionStatus, setActionStatus] = useState<string | null>(null)

  // ── Read pair data ─────────────────────────────────────────────────────────
  const {
    data: pairData,
    isLoading: pairLoading,
    error: pairError,
  } = useReadContract({
    address: ANIMA_REGISTRY_ROUTER_ADDRESS,
    abi: ANIMA_REGISTRY_ROUTER_ABI,
    functionName: 'getPair',
    args: pairIdBigInt !== null ? [pairIdBigInt] : undefined,
    query: {
      enabled:
        pairIdBigInt !== null &&
        ANIMA_REGISTRY_ROUTER_ADDRESS !== '0x0000000000000000000000000000000000000000',
    },
  })

  const pair = pairData as Pair | undefined

  // ── Write: wrap ─────────────────────────────────────────────────────────────
  const { writeContractAsync: doWrap, isPending: wrapping, data: wrapTxHash } = useWriteContract()
  const { isLoading: wrapConfirming } = useWaitForTransactionReceipt({ hash: wrapTxHash })

  async function handleWrap() {
    if (!pairIdBigInt || !wrapAmount) return
    setTxError(null)
    setActionStatus('Preparing wrap…')
    try {
      const scale = pair?.decimals ?? 6
      const [whole, frac = ''] = wrapAmount.split('.')
      const padded = frac.padEnd(scale, '0').slice(0, scale)
      const erc20Amount = BigInt(whole) * 10n ** BigInt(scale) + BigInt(padded)
      await doWrap({
        address: ANIMA_REGISTRY_ROUTER_ADDRESS,
        abi: ANIMA_REGISTRY_ROUTER_ABI,
        functionName: 'wrap',
        args: [pairIdBigInt, erc20Amount],
      })
      setActionStatus('Wrap submitted! Pulls ERC-20 → approves wrapper.')
      setWrapAmount('')
    } catch (e) {
      setTxError(e instanceof Error ? e.message : 'Wrap failed')
    } finally {
      setActionStatus(null)
    }
  }

  // ── Write: unwrap ───────────────────────────────────────────────────────────
  const {
    writeContractAsync: doUnwrap,
    isPending: unwrapping,
    data: unwrapTxHash,
  } = useWriteContract()
  const { isLoading: unwrapConfirming } = useWaitForTransactionReceipt({ hash: unwrapTxHash })

  async function handleUnwrap() {
    if (!pairIdBigInt || !unwrapAmount) return
    setTxError(null)
    setActionStatus('Preparing unwrap…')
    try {
      const scale = pair?.decimals ?? 6
      const [whole, frac = ''] = unwrapAmount.split('.')
      const padded = frac.padEnd(scale, '0').slice(0, scale)
      const erc20Amount = BigInt(whole) * 10n ** BigInt(scale) + BigInt(padded)
      await doUnwrap({
        address: ANIMA_REGISTRY_ROUTER_ADDRESS,
        abi: ANIMA_REGISTRY_ROUTER_ABI,
        functionName: 'unwrap',
        args: [pairIdBigInt, erc20Amount],
      })
      setActionStatus('Unwrap submitted! Approves wrapper → emits Unwrapped event.')
      setUnwrapAmount('')
    } catch (e) {
      setTxError(e instanceof Error ? e.message : 'Unwrap failed')
    } finally {
      setActionStatus(null)
    }
  }

  // ── Write: faucet ───────────────────────────────────────────────────────────
  const {
    writeContractAsync: doFaucet,
    isPending: fauceting,
    data: faucetTxHash,
  } = useWriteContract()
  const { isLoading: faucetConfirming } = useWaitForTransactionReceipt({ hash: faucetTxHash })

  async function handleFaucet() {
    if (!pair || pair.erc20 === '0x0000000000000000000000000000000000000000') return
    setTxError(null)
    setActionStatus('Minting testnet tokens…')
    try {
      await doFaucet({
        address: ANIMA_REGISTRY_ROUTER_ADDRESS,
        abi: ANIMA_REGISTRY_ROUTER_ABI,
        functionName: 'faucet',
        args: [pair.erc20, 1_000n * 10n ** BigInt(pair.decimals)],
      })
      setActionStatus(`1,000 ${pair.symbol} minted!`)
    } catch (e) {
      setTxError(e instanceof Error ? e.message : 'Faucet failed')
    } finally {
      setActionStatus(null)
    }
  }

  // ── Write: grant decrypt permit ─────────────────────────────────────────────
  const { writeContractAsync: doGrantPermit, isPending: permitting } = useWriteContract()

  async function handleGrantPermit() {
    if (!pair || pair.erc7984 === '0x0000000000000000000000000000000000000000') return
    setTxError(null)
    setActionStatus('Granting decrypt permit…')
    try {
      await doGrantPermit({
        address: ANIMA_REGISTRY_ROUTER_ADDRESS,
        abi: ANIMA_REGISTRY_ROUTER_ABI,
        functionName: 'grantDecryptPermit',
        args: [pair.erc7984],
      })
      setActionStatus('Decrypt permit event emitted!')
    } catch (e) {
      setTxError(e instanceof Error ? e.message : 'Grant failed')
    } finally {
      setActionStatus(null)
    }
  }

  const isDeployed = ANIMA_REGISTRY_ROUTER_ADDRESS !== '0x0000000000000000000000000000000000000000'

  const isPending =
    wrapping ||
    unwrapping ||
    wrapConfirming ||
    unwrapConfirming ||
    fauceting ||
    faucetConfirming ||
    permitting

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <main className="mx-auto max-w-3xl px-6 pb-32 pt-28">
      {/* Header */}
      <div className="flex items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="kicker">BOUNTY TRACK · PAIR #{pairId}</span>
            <ShieldBadge />
          </div>
          {pair && !pairLoading ? (
            <h1
              className="mt-3 font-display text-[clamp(34px,4vw,56px)] font-light leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]"
              style={{ fontVariationSettings: '"opsz" 96, "SOFT" 30, "WONK" 0' }}
            >
              {pair.name}
            </h1>
          ) : (
            <h1 className="mt-3 font-display text-[clamp(34px,4vw,42px)] font-light leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]">
              {pairIdBigInt !== null ? `Pair #${pairId}` : 'Invalid pair'}
            </h1>
          )}
          {pair && !pairLoading && (
            <p className="mt-2 font-mono text-[15px] text-[var(--color-ink-2)]">
              {pair.symbol} ↔ c{pair.symbol}
            </p>
          )}
        </div>
        <Link
          href="/registry"
          className="hidden shrink-0 rounded-lg border border-[var(--color-border)] px-4 py-2 text-[13px] text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] sm:inline-flex"
        >
          ← Back
        </Link>
      </div>

      {/* Not deployed */}
      {!isDeployed && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3">
          <p className="font-mono text-[12px] text-amber-700">
            AnimaRegistryRouter not yet deployed — run <code>pnpm deploy:sepolia</code>.
          </p>
        </div>
      )}

      {/* Invalid pair ID */}
      {pairIdBigInt === null && (
        <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
          <p className="font-mono text-[14px] text-red-600">
            Invalid pair ID: &ldquo;{pairId}&rdquo;
          </p>
          <Link
            href="/registry"
            className="mt-4 inline-flex items-center gap-1 font-mono text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"
          >
            ← Back to registry
          </Link>
        </div>
      )}

      {/* Loading */}
      {pairLoading && (
        <div className="mt-10 grid gap-4">
          <div className="h-24 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
          <div className="h-40 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
        </div>
      )}

      {/* Pair not found on-chain */}
      {!pairLoading && pair === undefined && pairIdBigInt !== null && (
        <div className="mt-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] px-6 py-8 text-center">
          <p className="text-[15px] text-[var(--color-ink-2)]">
            Pair #{pairId} not found on-chain.
          </p>
          <p className="mt-1 font-mono text-[12px] text-[var(--color-ink-3)]">
            The pair index may not exist in the Zama Wrappers Registry, or the contract may not be
            deployed.
          </p>
          <Link
            href="/registry"
            className="mt-4 inline-flex items-center gap-1 font-mono text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"
          >
            ← Back to registry
          </Link>
        </div>
      )}

      {/* Pair detail */}
      {pair && !pairLoading && (
        <div className="mt-8 grid gap-6">
          {/* Contract addresses card */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
            <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
              CONTRACT ADDRESSES
            </span>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3">
                <div className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
                  ERC-20 (Underlying)
                </div>
                <p className="mt-1 font-mono text-[13px] text-[var(--color-ink)]">
                  {pair.erc20 === '0x0000000000000000000000000000000000000000'
                    ? 'Not set'
                    : `${pair.erc20.slice(0, 8)}…${pair.erc20.slice(-6)}`}
                </p>
                {pair.erc20 !== '0x0000000000000000000000000000000000000000' && (
                  <Link
                    href={`https://sepolia.etherscan.io/address/${pair.erc20}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] text-[var(--color-ink-3)] hover:text-[var(--color-ink)]"
                  >
                    Etherscan ↗
                  </Link>
                )}
              </div>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3">
                <div className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
                  ERC-7984 (Confidential Wrapper)
                </div>
                <p className="mt-1 font-mono text-[13px] text-[var(--color-ink)]">
                  {pair.erc7984 === '0x0000000000000000000000000000000000000000'
                    ? 'Not set'
                    : `${pair.erc7984.slice(0, 8)}…${pair.erc7984.slice(-6)}`}
                </p>
                {pair.erc7984 !== '0x0000000000000000000000000000000000000000' && (
                  <Link
                    href={`https://sepolia.etherscan.io/address/${pair.erc7984}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] text-[var(--color-ink-3)] hover:text-[var(--color-ink)]"
                  >
                    Etherscan ↗
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Wrap card */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
            <h2 className="font-display text-[18px] font-light tracking-tight text-[var(--color-ink)]">
              Wrap ERC-20 → c{pair.symbol}
            </h2>
            <p className="mt-1 text-[13px] leading-snug text-[var(--color-ink-2)]">
              Pulls {pair.symbol} from your wallet into the router and approves the official
              ERC-7984 wrapper. Then call the wrapper directly with your encrypted amount to
              complete the wrap.
            </p>
            <div className="mt-4 flex items-end gap-3">
              <div className="flex-1">
                <label className="block font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
                  Amount ({pair.symbol})
                </label>
                <input
                  type="number"
                  value={wrapAmount}
                  onChange={e => setWrapAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={isPending}
                  className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2 font-mono text-[14px] text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-ink-2)] disabled:opacity-60"
                />
              </div>
              <button
                type="button"
                onClick={() => void handleWrap()}
                disabled={
                  !wrapAmount ||
                  !isConnected ||
                  isPending ||
                  pair.erc20 === '0x0000000000000000000000000000000000000000'
                }
                className="shrink-0 rounded-lg bg-[var(--color-ink)] px-5 py-2 text-[13px] font-medium text-[var(--color-cream)] transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {wrapping ? 'Wrapping…' : wrapConfirming ? 'Confirming…' : 'Wrap'}
              </button>
            </div>
          </div>

          {/* Unwrap card */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
            <h2 className="font-display text-[18px] font-light tracking-tight text-[var(--color-ink)]">
              Unwrap c{pair.symbol} → {pair.symbol}
            </h2>
            <p className="mt-1 text-[13px] leading-snug text-[var(--color-ink-2)]">
              Emits an event to prepare the unwrap. The actual confidential unwrap requires calling
              the ERC-7984 wrapper directly with your encrypted amount and ZKPoK.
            </p>
            <div className="mt-4 flex items-end gap-3">
              <div className="flex-1">
                <label className="block font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
                  Amount ({pair.symbol})
                </label>
                <input
                  type="number"
                  value={unwrapAmount}
                  onChange={e => setUnwrapAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={isPending}
                  className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2 font-mono text-[14px] text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-ink-2)] disabled:opacity-60"
                />
              </div>
              <button
                type="button"
                onClick={() => void handleUnwrap()}
                disabled={
                  !unwrapAmount ||
                  !isConnected ||
                  isPending ||
                  pair.erc7984 === '0x0000000000000000000000000000000000000000'
                }
                className="shrink-0 rounded-lg border border-[var(--color-border)] px-5 py-2 text-[13px] font-medium text-[var(--color-ink-2)] transition-all hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {unwrapping ? 'Unwrapping…' : unwrapConfirming ? 'Confirming…' : 'Unwrap'}
              </button>
            </div>
          </div>

          {/* Decrypt + Faucet + Permit row */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Decrypt */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-4">
              <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
                DECRYPT BALANCE
              </span>
              <p className="mt-1 text-[12px] leading-snug text-[var(--color-ink-2)]">
                One EIP-712 signature decrypts your c{pair.symbol} balance in-browser.
              </p>
              <div className="mt-3">
                {isConnected && pair.erc7984 !== '0x0000000000000000000000000000000000000000' ? (
                  <DecryptButton contractAddress={pair.erc7984} label={`c${pair.symbol}`} />
                ) : (
                  <span className="font-mono text-[12px] text-[var(--color-ink-3)]">
                    {isConnected ? 'Wrapper not deployed' : 'Connect wallet'}
                  </span>
                )}
              </div>
            </div>

            {/* Faucet */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-4">
              <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
                TESTNET FAUCET
              </span>
              <p className="mt-1 text-[12px] leading-snug text-[var(--color-ink-2)]">
                Mint 1,000 {pair.symbol} from the official cTokenMock.
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => void handleFaucet()}
                  disabled={
                    !isConnected ||
                    fauceting ||
                    pair.erc20 === '0x0000000000000000000000000000000000000000'
                  }
                  className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[12px] text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] disabled:opacity-50"
                >
                  {fauceting ? 'Minting…' : faucetConfirming ? 'Confirming…' : `Get ${pair.symbol}`}
                </button>
              </div>
            </div>

            {/* Decrypt permit */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-4">
              <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
                DECRYPT PERMIT
              </span>
              <p className="mt-1 text-[12px] leading-snug text-[var(--color-ink-2)]">
                Grant on-chain permission for EIP-712 decryption.
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => void handleGrantPermit()}
                  disabled={
                    !isConnected ||
                    permitting ||
                    pair.erc7984 === '0x0000000000000000000000000000000000000000'
                  }
                  className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[12px] text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] disabled:opacity-50"
                >
                  {permitting ? 'Granting…' : 'Grant permit'}
                </button>
              </div>
            </div>
          </div>

          {/* Status / Errors */}
          {actionStatus && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-3">
              <p className="font-mono text-[13px] text-[var(--color-ink)]">{actionStatus}</p>
            </div>
          )}
          {txError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-3">
              <p className="font-mono text-[12px] text-red-600">{txError}</p>
            </div>
          )}

          {/* Contract info */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-[15px] font-medium text-[var(--color-ink)]">
                  AnimaRegistryRouter
                </h4>
                <p className="mt-0.5 font-mono text-[11px] text-[var(--color-ink-3)]">
                  {ANIMA_REGISTRY_ROUTER_ADDRESS}
                </p>
              </div>
              <Link
                href={`https://sepolia.etherscan.io/address/${ANIMA_REGISTRY_ROUTER_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[12px] text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)]"
              >
                Etherscan ↗
              </Link>
            </div>
          </div>

          <Link
            href="/registry"
            className="inline-flex items-center gap-1 font-mono text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"
          >
            ← Back to Registry
          </Link>
        </div>
      )}
    </main>
  )
}
