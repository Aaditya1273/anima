'use client'

import { ShieldBadge } from '@/components/fhe/ConfidentialAmount'
import { ConfidentialAmount } from '@/components/fhe/ConfidentialAmount'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  createConfidentialAirdrop,
  estimateMevExposure,
  resetTokenOpsClient,
  type TokenOpsRecipient,
} from '@/lib/tokenops/client'
import {
  ANIMA_DISPERSE_ADDRESS,
  ANIMA_PAYROLL_ADDRESS,
} from '@anima/shared'

type Recipient = { address: string; amount: string }

type DeployState =
  | { status: 'idle' }
  | { status: 'encrypting' }
  | { status: 'signing' }
  | { status: 'broadcasting' }
  | { status: 'done'; id: bigint; txHash: string }
  | { status: 'error'; message: string }

export default function DispersePage() {
  const { address: account, isConnected } = useAccount()
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [recipientInput, setRecipientInput] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [showVesting, setShowVesting] = useState(false)
  const [cliffDays, setCliffDays] = useState('0')
  const [linearDays, setLinearDays] = useState('0')
  const [tokenAddress, setTokenAddress] = useState('')
  const [deployState, setDeployState] = useState<DeployState>({ status: 'idle' })
  const csvRef = useRef<HTMLInputElement>(null)

  // ── helpers ───────────────────────────────────────────────────────────────

  function addRecipient() {
    if (!recipientInput || !amountInput) return
    setRecipients(prev => [...prev, { address: recipientInput, amount: amountInput }])
    setRecipientInput('')
    setAmountInput('')
  }

  function removeRecipient(i: number) {
    setRecipients(prev => prev.filter((_, idx) => idx !== i))
  }

  // CSV import: each row is "address,amount"
  const handleCsvFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const text = (e.target?.result as string) ?? ''
      const rows = text
        .split('\n')
        .map(r => r.trim())
        .filter(r => r && !r.startsWith('#'))
      const parsed: Recipient[] = []
      for (const row of rows) {
        const [addr, amt] = row.split(',')
        if (addr?.startsWith('0x') && amt && Number(amt) > 0) {
          parsed.push({ address: addr.trim(), amount: amt.trim() })
        }
      }
      if (parsed.length > 0) {
        setRecipients(prev => [...prev, ...parsed])
      }
    }
    reader.readAsText(file)
  }, [])

  // ── MEV risk (uses real estimateMevExposure) ──────────────────────────────

  const totalRaw = recipients.reduce((s, r) => s + (Number.parseFloat(r.amount) || 0), 0)
  const totalBigInt = BigInt(Math.floor(totalRaw * 1e6)) // 6-decimal scaled
  const mev = estimateMevExposure(totalBigInt)
  const mevDisplay = recipients.length > 0
    ? `~${(Number(mev.exposedAmount) / 1e6).toFixed(2)} tokens`
    : '—'

  // ── deploy ────────────────────────────────────────────────────────────────

  async function handleDeploy() {
    if (!isConnected || recipients.length === 0) return
    const token = (tokenAddress || ANIMA_PAYROLL_ADDRESS) as `0x${string}`
    const disperseContract = ANIMA_DISPERSE_ADDRESS

    const mapped: TokenOpsRecipient[] = recipients.map(r => ({
      address: r.address as `0x${string}`,
      amount: BigInt(Math.floor(Number.parseFloat(r.amount) * 1e6)),
    }))

    const vesting =
      showVesting && (Number(cliffDays) > 0 || Number(linearDays) > 0)
        ? {
            cliff: Number(cliffDays) * 86400,
            linear: Number(linearDays) * 86400,
          }
        : undefined

    try {
      setDeployState({ status: 'encrypting' })
      // TokenOps SDK fires status callbacks internally; we mirror them here
      // by transitioning through states before the final await resolves.
      const timeoutHandle = setTimeout(() => {
        setDeployState({ status: 'signing' })
        setTimeout(() => setDeployState({ status: 'broadcasting' }), 4000)
      }, 1500)

      const result = await createConfidentialAirdrop({
        token,
        disperseContract,
        recipients: mapped,
        vestingSchedule: vesting,
      })

      clearTimeout(timeoutHandle)
      setDeployState({ status: 'done', id: result.id, txHash: result.txHash })
      // Reset singleton so next call picks up any new signer
      resetTokenOpsClient()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Deployment failed'
      setDeployState({ status: 'error', message: msg })
    }
  }

  const deployLabel = {
    idle: `Deploy distribution (${recipients.length} recipients)`,
    encrypting: 'Encrypting allocations…',
    signing: 'Sign in wallet…',
    broadcasting: 'Broadcasting transaction…',
    done: 'Deployed ✓',
    error: 'Retry deployment',
  }[deployState.status]

  const isPending = ['encrypting', 'signing', 'broadcasting'].includes(deployState.status)

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <main className="mx-auto max-w-5xl px-6 pt-28 pb-32">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="kicker">TOKENOPS × SPECIAL BOUNTY</span>
            <ShieldBadge />
          </div>
          <h1
            className="mt-3 font-display text-[clamp(34px,4vw,56px)] font-light leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]"
            style={{ fontVariationSettings: '"opsz" 96, "SOFT" 30, "WONK" 0' }}
          >
            Confidential Disperse
          </h1>
          <p className="mt-3 max-w-[52ch] text-[15.5px] leading-[1.65] text-[var(--color-ink-2)]">
            Encrypted token distributions powered by{' '}
            <Link
              href="https://tokenops.xyz"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-[var(--color-border-strong)] underline-offset-[3px] hover:decoration-[var(--color-ink)]"
            >
              TokenOps SDK
            </Link>
            . Recipient lists and per-person amounts stay encrypted on-chain.
          </p>
        </div>
      </div>

      {!isConnected ? (
        <div className="mt-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-8 text-center">
          <p className="text-[15px] text-[var(--color-ink-2)]">
            Connect your wallet to create or claim distributions.
          </p>
          <Link
            href="/console"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-[13px] font-medium text-[var(--color-cream)]"
          >
            Connect wallet →
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ── Left: create distribution ─────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Token address */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
              <label className="block font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
                ERC-7984 token address (leave blank to use AnimaPayroll default)
              </label>
              <input
                type="text"
                value={tokenAddress}
                onChange={e => setTokenAddress(e.target.value)}
                placeholder={ANIMA_PAYROLL_ADDRESS}
                className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2 font-mono text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink-2)]"
              />
            </div>

            {/* Add recipients */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
              <h2 className="font-display text-[18px] font-light tracking-tight text-[var(--color-ink)]">
                Add recipients
              </h2>
              <p className="mt-1 text-[13px] text-[var(--color-ink-2)]">
                Each amount is FHE-encrypted by the TokenOps SDK before it reaches the chain.
                The full recipient list is never revealed on-chain.
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="block font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
                    Address (0x...)
                  </label>
                  <input
                    type="text"
                    value={recipientInput}
                    onChange={e => setRecipientInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addRecipient() }}
                    placeholder="0x..."
                    className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2 font-mono text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink-2)]"
                  />
                </div>
                <div className="w-full sm:w-36">
                  <label className="block font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={amountInput}
                    onChange={e => setAmountInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addRecipient() }}
                    placeholder="0.00"
                    className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2 font-mono text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink-2)]"
                  />
                </div>
                <button
                  type="button"
                  onClick={addRecipient}
                  disabled={!recipientInput || !amountInput}
                  className="rounded-lg bg-[var(--color-ink)] px-4 py-2 text-[13px] font-medium text-[var(--color-cream)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add
                </button>
              </div>

              {/* CSV import */}
              <div
                className="mt-3 cursor-pointer rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-center transition-colors hover:border-[var(--color-ink-3)]"
                onClick={() => csvRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault()
                  const file = e.dataTransfer.files[0]
                  if (file) handleCsvFile(file)
                }}
              >
                <input
                  ref={csvRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleCsvFile(file)
                    e.target.value = ''
                  }}
                />
                <span className="text-[13px] text-[var(--color-ink-3)]">
                  Drop CSV or click to import — one row per line:{' '}
                  <code className="font-mono">0xAddress,amount</code>
                </span>
              </div>

              {/* Recipient list */}
              {recipients.length > 0 ? (
                <div className="mt-4 space-y-1.5">
                  {recipients.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <ShieldBadge />
                        <span className="truncate font-mono text-[12px] text-[var(--color-ink-2)]">
                          {r.address.slice(0, 6)}…{r.address.slice(-4)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[12px] text-[var(--color-ink)]">
                          {r.amount}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeRecipient(i)}
                          className="text-[11px] text-[var(--color-ink-3)] hover:text-red-500"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setRecipients([])}
                    className="mt-1 text-[12px] text-[var(--color-ink-3)] hover:text-red-500"
                  >
                    Clear all
                  </button>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-6 text-center">
                  <span className="text-[13px] text-[var(--color-ink-3)]">
                    No recipients yet
                  </span>
                </div>
              )}
            </div>

            {/* Vesting */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
              <button
                type="button"
                onClick={() => setShowVesting(!showVesting)}
                className="flex w-full items-center justify-between"
              >
                <h2 className="font-display text-[18px] font-light tracking-tight text-[var(--color-ink)]">
                  Vesting schedule
                  <span className="ml-2 font-mono text-[12px] text-[var(--color-ink-3)]">
                    optional
                  </span>
                </h2>
                <span className="text-[var(--color-ink-3)]">{showVesting ? '−' : '+'}</span>
              </button>
              {showVesting && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
                      Cliff (days)
                    </label>
                    <input
                      type="number"
                      value={cliffDays}
                      onChange={e => setCliffDays(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2 font-mono text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink-2)]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
                      Linear vesting (days)
                    </label>
                    <input
                      type="number"
                      value={linearDays}
                      onChange={e => setLinearDays(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2 font-mono text-[13px] text-[var(--color-ink)] outline-none focus:border-[var(--color-ink-2)]"
                    />
                  </div>
                  <p className="col-span-2 text-[13px] text-[var(--color-ink-3)]">
                    Cliff + linear schedule encoded in AnimaDisperse.VestingSchedule. The claimable
                    fraction is computed on-chain via{' '}
                    <code className="font-mono">FHE.shr(FHE.mul(allocation, fraction), 20)</code> —
                    never revealed.
                  </p>
                </div>
              )}
            </div>

            {/* Deploy */}
            {recipients.length > 0 && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => void handleDeploy()}
                  disabled={isPending || deployState.status === 'done'}
                  className="w-full rounded-xl bg-[var(--color-ink)] px-6 py-3.5 text-[15px] font-medium text-[var(--color-cream)] transition-all hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                >
                  {deployLabel}
                </button>

                {deployState.status === 'error' && (
                  <p className="font-mono text-[12px] text-red-500">{deployState.message}</p>
                )}

                {deployState.status === 'done' && (
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-4">
                    <p className="text-[13px] text-[var(--color-ink)]">
                      Distribution #{deployState.id.toString()} deployed.
                    </p>
                    <Link
                      href={`https://sepolia.etherscan.io/tx/${deployState.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 font-mono text-[12px] text-[var(--color-ink-2)] underline-offset-2 hover:underline"
                    >
                      {deployState.txHash.slice(0, 10)}… ↗
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right column ──────────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* MEV risk calculator (real estimateMevExposure) */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5">
              <h3 className="font-display text-[15px] font-medium text-[var(--color-ink)]">
                ⚠ MEV risk estimate
              </h3>
              <p className="mt-1 text-[13px] leading-[1.55] text-[var(--color-ink-2)]">
                A public distribution of this size would expose approximately:
              </p>
              <div className="mt-3">
                <div className="font-mono text-[22px] text-[var(--color-ink)]">
                  {mevDisplay}
                </div>
                <div className="font-mono text-[12px] text-[var(--color-ink-3)]">
                  to MEV front-runs (est. 17% within 72h)
                </div>
              </div>
              <p className="mt-3 text-[12px] leading-[1.5] text-[var(--color-ink-2)]">
                Source: TokenOps acquisition data. An encrypted distribution prevents this entirely.
              </p>
            </div>

            {/* Recipient claim panel */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5">
              <h3 className="font-display text-[15px] font-medium text-[var(--color-ink)]">
                Recipient claim
              </h3>
              <p className="mt-1 text-[13px] leading-[1.55] text-[var(--color-ink-2)]">
                Share{' '}
                <code className="font-mono text-[12px]">/disperse/[id]</code> with each recipient.
                They connect, sign one EIP-712 — only their allocation decrypts, in their browser
                only.
              </p>
              <ConfidentialAmount
                label="Preview — your allocation"
                value={null}
                symbol="cToken"
              />
            </div>

            {/* Contract */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5">
              <h4 className="font-display text-[15px] font-medium text-[var(--color-ink)]">
                Contract
              </h4>
              <Link
                href={`https://sepolia.etherscan.io/address/${ANIMA_DISPERSE_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 font-mono text-[13px] text-[var(--color-ink-2)] underline-offset-2 hover:text-[var(--color-ink)] hover:underline"
              >
                AnimaDisperse.sol ↗
              </Link>
              <div className="mt-2 font-mono text-[11px] text-[var(--color-ink-3)]">
                {ANIMA_DISPERSE_ADDRESS === '0x0000000000000000000000000000000000000000'
                  ? 'Deploy pending — run pnpm deploy:sepolia'
                  : ANIMA_DISPERSE_ADDRESS}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
