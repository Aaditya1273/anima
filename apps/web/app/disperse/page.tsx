'use client'

import { RecipientImport, type RecipientItem } from '@/components/disperse/RecipientImport'
import { RiskCalculator } from '@/components/disperse/RiskCalculator'
import { VestingSchedule } from '@/components/disperse/VestingSchedule'
import { ShieldBadge } from '@/components/fhe/ConfidentialAmount'
import { ConfidentialAmount } from '@/components/fhe/ConfidentialAmount'
import {
  type TokenOpsRecipient,
  createConfidentialAirdrop,
  resetTokenOpsClient,
} from '@/lib/tokenops/client'
import { ANIMA_DISPERSE_ADDRESS, ANIMA_PAYROLL_ADDRESS } from '@anima/shared'
import Link from 'next/link'
import { useState } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'

type DeployState =
  | { status: 'idle' }
  | { status: 'deploying' }
  | { status: 'done'; airdropAddress: `0x${string}`; txHash: string }
  | { status: 'error'; message: string }

export default function DispersePage() {
  const { isConnected } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const [recipients, setRecipients] = useState<RecipientItem[]>([])
  const [showVesting, setShowVesting] = useState(false)
  const [cliffDays, setCliffDays] = useState(0)
  const [linearDays, setLinearDays] = useState(0)
  const [tokenAddress, setTokenAddress] = useState('')
  const [deployState, setDeployState] = useState<DeployState>({ status: 'idle' })

  // ── MEV risk ──────────────────────────────────────────────────────────────
  const totalRaw = recipients.reduce((s, r) => s + (Number.parseFloat(r.amount) || 0), 0)

  // ── deploy ────────────────────────────────────────────────────────────────
  async function handleDeploy() {
    if (!isConnected || !publicClient || !walletClient || recipients.length === 0) return
    const token = (tokenAddress || ANIMA_PAYROLL_ADDRESS) as `0x${string}`

    const mapped: TokenOpsRecipient[] = recipients.map(r => ({
      address: r.address as `0x${string}`,
      amount: BigInt(Math.floor(Number.parseFloat(r.amount) * 1e6)),
    }))

    const vesting =
      showVesting && (cliffDays > 0 || linearDays > 0)
        ? {
            cliff: cliffDays * 86400,
            linear: linearDays * 86400,
          }
        : undefined

    try {
      setDeployState({ status: 'deploying' })
      const result = await createConfidentialAirdrop(
        {
          token,
          recipients: mapped,
          vestingSchedule: vesting,
        },
        publicClient,
        walletClient,
      )

      setDeployState({
        status: 'done',
        airdropAddress: result.airdropAddress,
        txHash: result.txHash,
      })
      resetTokenOpsClient()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Deployment failed'
      setDeployState({ status: 'error', message: msg })
    }
  }

  const deployLabel = {
    idle: `Deploy distribution (${recipients.length} recipients)`,
    deploying: 'Deploying…',
    done: 'Deployed ✓',
    error: 'Retry deployment',
  }[deployState.status]

  const isPending = deployState.status === 'deploying'

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

            {/* Recipient import — extracted component */}
            <RecipientImport recipients={recipients} onRecipientsChange={setRecipients} />

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
                <VestingSchedule
                  cliffDays={cliffDays}
                  linearDays={linearDays}
                  onCliffChange={setCliffDays}
                  onLinearChange={setLinearDays}
                />
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
                      Distribution deployed as a <strong>TokenOps ConfidentialAirdrop</strong>{' '}
                      clone.
                    </p>
                    <div className="mt-2 font-mono text-[12px] text-[var(--color-ink-2)]">
                      Airdrop contract:{' '}
                      <Link
                        href={`/disperse/${deployState.airdropAddress}`}
                        className="underline-offset-2 hover:underline hover:text-[var(--color-ink)]"
                      >
                        {deployState.airdropAddress.slice(0, 8)}…
                        {deployState.airdropAddress.slice(-6)}
                      </Link>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link
                        href={`https://sepolia.etherscan.io/address/${deployState.airdropAddress}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1.5 font-mono text-[11px] text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)]"
                      >
                        Etherscan ↗
                      </Link>
                      <Link
                        href={`https://sepolia.etherscan.io/tx/${deployState.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1.5 font-mono text-[11px] text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)]"
                      >
                        Tx ↗
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right column ──────────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* MEV risk calculator — extracted component */}
            <RiskCalculator totalRaw={totalRaw} hasRecipients={recipients.length > 0} />

            {/* Recipient claim panel */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5">
              <h3 className="font-display text-[15px] font-medium text-[var(--color-ink)]">
                Recipient claim
              </h3>
              <p className="mt-1 text-[13px] leading-[1.55] text-[var(--color-ink-2)]">
                Share <code className="font-mono text-[12px]">/disperse/[id]</code> with each
                recipient. They connect, sign one EIP-712 — only their allocation decrypts, in their
                browser only.
              </p>
              <ConfidentialAmount label="Preview — your allocation" value={null} symbol="cToken" />
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
