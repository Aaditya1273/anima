'use client'

import { ConfidentialAmount, ShieldBadge } from '@/components/fhe/ConfidentialAmount'
import { FheInput } from '@/components/fhe/FheInput'
import { ANIMA_DISPERSE_ADDRESS } from '@anima/shared'
import { ANIMA_DISPERSE_ABI } from '@anima/shared'
import { useEncrypt } from '@zama-fhe/react-sdk'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

// ─── Minimal ConfidentialAirdrop clone ABI ─────────────────────────────────────
// TokenOps deploys ConfidentialAirdrop clones via its on-chain factory.
// These clones expose standard read functions that let us display basic info.
// The full claim flow requires the admin-signed authorization via @tokenops/sdk.
const CONFIDENTIAL_AIRDROP_ABI = [
  {
    type: 'function' as const,
    name: 'token',
    stateMutability: 'view' as const,
    inputs: [],
    outputs: [{ type: 'address' as const }],
  },
  {
    type: 'function' as const,
    name: 'distributor',
    stateMutability: 'view' as const,
    inputs: [],
    outputs: [{ type: 'address' as const }],
  },
  {
    type: 'function' as const,
    name: 'getAllocation',
    stateMutability: 'view' as const,
    inputs: [{ type: 'address' as const }],
    outputs: [{ type: 'bytes32' as const }],
  },
  {
    type: 'function' as const,
    name: 'claimed',
    stateMutability: 'view' as const,
    inputs: [{ type: 'address' as const }],
    outputs: [{ type: 'bool' as const }],
  },
]

// ─── Type helpers ──────────────────────────────────────────────────────────────

type PageState =
  | { status: 'loading' }
  | { status: 'invalid'; message: string }
  | { status: 'ready' }

function isEvmAddress(s: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(s)
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function DistributionClaimPage() {
  const params = useParams()
  const distId = params.distId as string
  const { address, isConnected } = useAccount()

  // Detect whether the param is a direct clone address or a numeric distribution ID
  const isCloneAddress = useMemo(() => isEvmAddress(distId), [distId])

  const distIdBigInt = useMemo(() => {
    if (isCloneAddress) return null
    try {
      return BigInt(distId)
    } catch {
      return null
    }
  }, [distId, isCloneAddress])

  const pageState: PageState = useMemo(
    () =>
      isCloneAddress || distIdBigInt !== null
        ? { status: 'ready' }
        : { status: 'invalid', message: 'Invalid distribution ID or contract address' },
    [isCloneAddress, distIdBigInt],
  )

  // If the param is an address, render the TokenOps clone view
  if (isCloneAddress) {
    return (
      <CloneClaimView
        cloneAddress={distId as `0x${string}`}
        address={address}
        isConnected={isConnected}
      />
    )
  }

  // Otherwise render the existing AnimaDisperse flow
  return (
    <AnimaDisperseClaimView
      distId={distId}
      distIdBigInt={distIdBigInt}
      pageState={pageState}
      address={address}
      isConnected={isConnected}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TokenOps Clone View
// ═══════════════════════════════════════════════════════════════════════════════

function CloneClaimView({
  cloneAddress,
  address,
  isConnected,
}: {
  cloneAddress: `0x${string}`
  address: `0x${string}` | undefined
  isConnected: boolean
}) {
  // ── Read clone metadata ──────────────────────────────────────────────────
  const tokenData = useReadContract({
    address: cloneAddress,
    abi: CONFIDENTIAL_AIRDROP_ABI,
    functionName: 'token',
  })
  const tokenAddr = tokenData.data as `0x${string}` | undefined
  const tokenLoading = tokenData.isLoading

  const distData = useReadContract({
    address: cloneAddress,
    abi: CONFIDENTIAL_AIRDROP_ABI,
    functionName: 'distributor',
  })
  const distributor = distData.data as `0x${string}` | undefined
  const distLoading = distData.isLoading

  const allocData = useReadContract({
    address: cloneAddress,
    abi: CONFIDENTIAL_AIRDROP_ABI,
    functionName: 'getAllocation',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })
  const allocation = allocData.data as `0x${string}` | undefined
  const allocLoading = allocData.isLoading

  const claimedData = useReadContract({
    address: cloneAddress,
    abi: CONFIDENTIAL_AIRDROP_ABI,
    functionName: 'claimed',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })
  const hasClaimed = claimedData.data as boolean | undefined
  const claimedLoading = claimedData.isLoading

  const isLoading = tokenLoading || distLoading
  const isRecipient =
    allocation !== undefined &&
    allocation !== '0x0000000000000000000000000000000000000000000000000000000000000000'
  const isClaimed = hasClaimed === true

  return (
    <main className="mx-auto max-w-3xl px-6 pb-32 pt-28">
      {/* Header */}
      <div className="flex items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="kicker">TOKENOPS × SPECIAL BOUNTY</span>
            <ShieldBadge />
          </div>
          <h1
            className="mt-3 font-display text-[clamp(34px,4vw,56px)] font-light leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]"
            style={{ fontVariationSettings: '"opsz" 96, "SOFT" 30, "WONK" 0' }}
          >
            TokenOps Distribution
          </h1>
          <p className="mt-1 font-mono text-[13px] text-[var(--color-ink-3)]">
            {cloneAddress.slice(0, 8)}…{cloneAddress.slice(-6)}
          </p>
        </div>
        <Link
          href="/disperse"
          className="hidden shrink-0 rounded-lg border border-[var(--color-border)] px-4 py-2 text-[13px] text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] sm:inline-flex"
        >
          ← Back
        </Link>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="mt-10 grid gap-4">
          <div className="h-24 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
          <div className="h-32 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
        </div>
      )}

      {/* Clone info */}
      {!isLoading && (
        <div className="mt-8 grid gap-6">
          {/* Contract info card */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
            <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
              CONFIDENTIAL AIRDROP CLONE
            </span>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
                  Token
                </span>
                <p className="mt-0.5 font-mono text-[13px] text-[var(--color-ink)]">
                  {tokenAddr ? `${tokenAddr.slice(0, 6)}…${tokenAddr.slice(-4)}` : '—'}
                </p>
              </div>
              <div>
                <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
                  Distributor
                </span>
                <p className="mt-0.5 font-mono text-[13px] text-[var(--color-ink)]">
                  {distributor ? `${distributor.slice(0, 6)}…${distributor.slice(-4)}` : '—'}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Link
                href={`https://sepolia.etherscan.io/address/${cloneAddress}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1.5 font-mono text-[11px] text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)]"
              >
                View on Etherscan ↗
              </Link>
              {tokenAddr && (
                <Link
                  href={`https://sepolia.etherscan.io/address/${tokenAddr}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1.5 font-mono text-[11px] text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)]"
                >
                  Token ↗
                </Link>
              )}
            </div>
          </div>

          {/* Connect wallet gate */}
          {!isConnected && (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-8 text-center">
              <p className="text-[15px] text-[var(--color-ink-2)]">
                Connect your wallet to check your allocation
              </p>
              <Link
                href="/console"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-[13px] font-medium text-[var(--color-cream)]"
              >
                Connect wallet →
              </Link>
            </div>
          )}

          {/* Recipient status */}
          {isConnected && !allocLoading && !claimedLoading && (
            <>
              {!isRecipient && !isClaimed && (
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-8 text-center">
                  <p className="text-[15px] text-[var(--color-ink-2)]">
                    Your wallet does not have an allocation in this distribution.
                  </p>
                  <p className="mt-1 font-mono text-[12px] text-[var(--color-ink-3)]">
                    {address?.slice(0, 6)}…{address?.slice(-4)}
                  </p>
                </div>
              )}

              {isClaimed && (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-6 py-5 text-center">
                  <p className="font-display text-[18px] font-light text-green-800">✓ Claimed</p>
                  <p className="mt-1 font-mono text-[12px] text-green-600">
                    You have already claimed your allocation from this distribution.
                  </p>
                </div>
              )}

              {isRecipient && !isClaimed && (
                <div className="grid gap-6">
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
                    <ConfidentialAmount
                      label="Your allocation"
                      value={null}
                      isLoading={false}
                      symbol="cToken"
                    />
                    <p className="mt-3 text-[13px] leading-snug text-[var(--color-ink-2)]">
                      Your allocation is encrypted on-chain in this ConfidentialAirdrop clone.
                    </p>
                  </div>

                  {/* Claim guidance */}
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-4">
                    <h3 className="font-display text-[16px] font-light tracking-tight text-[var(--color-ink)]">
                      Claim via TokenOps SDK
                    </h3>
                    <p className="mt-1 text-[13px] leading-[1.6] text-[var(--color-ink-2)]">
                      This distribution was created by the TokenOps SDK. To claim your allocation,
                      the distributor needs to provide you with a signed claim authorization via the
                      SDK's <code className="font-mono">signClaimAuthorization</code> function.
                    </p>
                    <p className="mt-2 text-[13px] leading-[1.6] text-[var(--color-ink-2)]">
                      Once you have the signature, use the{' '}
                      <code className="font-mono">createConfidentialAirdropClient</code> from{' '}
                      <code className="font-mono">@tokenops/sdk/fhe-airdrop</code> and call{' '}
                      <code className="font-mono">claim({'{ signature, encryptedInput }'})</code>.
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`https://sepolia.etherscan.io/address/${cloneAddress}#writeContract`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1.5 font-mono text-[12px] text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)]"
                      >
                        Claim on Etherscan ↗
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <Link
            href="/disperse"
            className="inline-flex items-center gap-1 font-mono text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"
          >
            ← Back to Disperse
          </Link>
        </div>
      )}
    </main>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
//  AnimaDisperse View (existing flow)
// ═══════════════════════════════════════════════════════════════════════════════

function AnimaDisperseClaimView({
  distId,
  distIdBigInt,
  pageState,
  address,
  isConnected,
}: {
  distId: string
  distIdBigInt: bigint | null
  pageState: PageState
  address: `0x${string}` | undefined
  isConnected: boolean
}) {
  const [txError, setTxError] = useState<string | null>(null)
  const [claimAmount, setClaimAmount] = useState('')
  const [actionStatus, setActionStatus] = useState<string | null>(null)

  // ── Read distribution metadata ─────────────────────────────────────────────
  const { data: distData, isLoading: distLoading } = useReadContract({
    address: ANIMA_DISPERSE_ADDRESS,
    abi: ANIMA_DISPERSE_ABI,
    functionName: 'getDistribution',
    args: distIdBigInt !== null ? [distIdBigInt] : undefined,
    query: {
      enabled:
        distIdBigInt !== null &&
        ANIMA_DISPERSE_ADDRESS !== '0x0000000000000000000000000000000000000000',
    },
  })

  const distribution = useMemo(() => {
    if (!distData) return null
    const [token, distributor, createdAt, recipientCount, active, vestingCliff, vestingLinear] =
      distData as readonly [string, string, bigint, bigint, boolean, bigint, bigint]
    return {
      token,
      distributor,
      createdAt,
      recipientCount: Number(recipientCount),
      active,
      vestingCliff: Number(vestingCliff),
      vestingLinear: Number(vestingLinear),
    }
  }, [distData])

  // ── Read allocation for connected wallet ────────────────────────────────────
  const {
    data: encAllocation,
    isLoading: allocLoading,
    refetch: refetchAlloc,
  } = useReadContract({
    address: ANIMA_DISPERSE_ADDRESS,
    abi: ANIMA_DISPERSE_ABI,
    functionName: 'getAllocation',
    args: distIdBigInt !== null && address ? [distIdBigInt] : undefined,
    query: {
      enabled:
        distIdBigInt !== null &&
        !!address &&
        ANIMA_DISPERSE_ADDRESS !== '0x0000000000000000000000000000000000000000',
    },
  })

  // ── Read claimed status ─────────────────────────────────────────────────────
  const {
    data: hasClaimed,
    isLoading: claimedLoading,
    refetch: refetchClaimed,
  } = useReadContract({
    address: ANIMA_DISPERSE_ADDRESS,
    abi: ANIMA_DISPERSE_ABI,
    functionName: 'claimed',
    args: distIdBigInt !== null && address ? [distIdBigInt, address] : undefined,
    query: {
      enabled:
        distIdBigInt !== null &&
        !!address &&
        ANIMA_DISPERSE_ADDRESS !== '0x0000000000000000000000000000000000000000',
    },
  })

  // A zero allocation means the connected wallet is NOT a recipient
  const isRecipient =
    encAllocation !== undefined &&
    encAllocation !== '0x0000000000000000000000000000000000000000000000000000000000000000'
  const isClaimed = hasClaimed === true

  // ── Write hooks ─────────────────────────────────────────────────────────────
  const {
    writeContractAsync: requestPermit,
    isPending: permitting,
    data: permitTxHash,
  } = useWriteContract()
  const { isLoading: permitConfirming } = useWaitForTransactionReceipt({ hash: permitTxHash })
  const {
    writeContractAsync: writeClaim,
    isPending: claiming,
    data: claimTxHash,
  } = useWriteContract()
  const { isLoading: claimConfirming } = useWaitForTransactionReceipt({ hash: claimTxHash })
  const { mutateAsync: encryptAmount } = useEncrypt()

  // ── Vesting info ────────────────────────────────────────────────────────────
  const vestingInfo = useMemo(() => {
    if (!distribution) return null
    const now = Math.floor(Date.now() / 1000)
    const cliffEnd = Number(distribution.createdAt) + distribution.vestingCliff
    const linearEnd = cliffEnd + distribution.vestingLinear

    let status: 'none' | 'cliff' | 'vesting' | 'fully-vested'
    let label: string
    let progress: number | null = null

    if (distribution.vestingCliff === 0 && distribution.vestingLinear === 0) {
      status = 'none'
      label = 'Immediate — no vesting'
    } else if (now < cliffEnd) {
      status = 'cliff'
      const daysLeft = Math.ceil((cliffEnd - now) / 86400)
      label = `Cliff period — ${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining`
    } else if (distribution.vestingLinear > 0 && now < linearEnd) {
      status = 'vesting'
      const elapsed = now - cliffEnd
      progress = Math.min(100, Math.round((elapsed / distribution.vestingLinear) * 100))
      label = `${progress}% vested — linear schedule`
    } else {
      status = 'fully-vested'
      label = 'Fully vested'
    }

    return { status, label, progress, cliffEnd, linearEnd }
  }, [distribution])

  // ── Handler: request decrypt permit ─────────────────────────────────────────
  const handleRequestPermit = useCallback(async () => {
    if (!distIdBigInt) return
    setTxError(null)
    setActionStatus('Requesting decrypt permit…')
    try {
      await requestPermit({
        address: ANIMA_DISPERSE_ADDRESS,
        abi: ANIMA_DISPERSE_ABI,
        functionName: 'requestDecryptPermit',
        args: [distIdBigInt],
      })
      // Don't clear actionStatus — user needs to confirm in wallet
      // It stays visible to guide the user through the wallet popup
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Transaction failed'
      setTxError(msg)
      setActionStatus(null)
    }
  }, [distIdBigInt, requestPermit])

  // ── Handler: claim ──────────────────────────────────────────────────────────
  const handleClaim = useCallback(async () => {
    if (!distIdBigInt || !claimAmount || !address || !distribution) return
    setTxError(null)
    setActionStatus('Encrypting claim amount…')
    try {
      const enc = await encryptAmount({
        values: [{ value: BigInt(Math.floor(Number(claimAmount) * 1e6)), type: 'euint64' }],
        contractAddress: ANIMA_DISPERSE_ADDRESS,
        userAddress: address,
      })
      setActionStatus('Submitting claim transaction…')
      await writeClaim({
        address: ANIMA_DISPERSE_ADDRESS,
        abi: ANIMA_DISPERSE_ABI,
        functionName: 'claim',
        args: [distIdBigInt, enc.encryptedValues[0] as `0x${string}`, enc.inputProof],
      })
      setActionStatus('Claim submitted!')
      setClaimAmount('')
      void refetchClaimed()
      void refetchAlloc()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Claim failed'
      setTxError(msg)
    } finally {
      setActionStatus(null)
    }
  }, [
    distIdBigInt,
    claimAmount,
    address,
    distribution,
    encryptAmount,
    writeClaim,
    refetchClaimed,
    refetchAlloc,
  ])

  // ── Format timestamp ────────────────────────────────────────────────────────
  function formatTime(unixSeconds: bigint): string {
    const d = new Date(Number(unixSeconds) * 1000)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isDeployed = ANIMA_DISPERSE_ADDRESS !== '0x0000000000000000000000000000000000000000'

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <main className="mx-auto max-w-3xl px-6 pb-32 pt-28">
      {/* Header */}
      <div className="flex items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="kicker">TOKENOPS × SPECIAL BOUNTY</span>
            <ShieldBadge />
          </div>
          <h1
            className="mt-3 font-display text-[clamp(34px,4vw,56px)] font-light leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]"
            style={{ fontVariationSettings: '"opsz" 96, "SOFT" 30, "WONK" 0' }}
          >
            Distribution #{distId}
          </h1>
        </div>
        <Link
          href="/disperse"
          className="hidden shrink-0 rounded-lg border border-[var(--color-border)] px-4 py-2 text-[13px] text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] sm:inline-flex"
        >
          ← Back
        </Link>
      </div>

      {/* Contract not deployed */}
      {!isDeployed && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3">
          <p className="font-mono text-[12px] text-amber-700">
            AnimaDisperse not yet deployed — run <code>pnpm deploy:sepolia</code>.
          </p>
        </div>
      )}

      {/* Loading */}
      {distLoading && (
        <div className="mt-10 grid gap-4">
          <div className="h-24 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
          <div className="h-32 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)]" />
        </div>
      )}

      {/* Invalid or error */}
      {pageState.status === 'invalid' && !distLoading && (
        <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
          <p className="font-mono text-[14px] text-red-600">{pageState.message}</p>
          <Link
            href="/disperse"
            className="mt-4 inline-flex items-center gap-1 font-mono text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"
          >
            ← Back to distributions
          </Link>
        </div>
      )}

      {/* Distribution not found on-chain */}
      {!distLoading && distribution === null && pageState.status !== 'invalid' && (
        <div className="mt-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] px-6 py-8 text-center">
          <p className="text-[15px] text-[var(--color-ink-2)]">
            Distribution #{distId} not found on-chain.
          </p>
          <p className="mt-1 font-mono text-[12px] text-[var(--color-ink-3)]">
            The distribution may not exist or the contract has not been deployed.
          </p>
        </div>
      )}

      {/* Distribution details */}
      {distribution !== null && !distLoading && (
        <div className="mt-8 grid gap-6">
          {/* Distribution info card */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
                  DISTRIBUTION #{distId}
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] ${
                      distribution.active
                        ? 'bg-green-50 text-green-700'
                        : 'bg-[var(--color-cream)] text-[var(--color-ink-3)]'
                    }`}
                  >
                    <span
                      className={`block h-1.5 w-1.5 rounded-full ${
                        distribution.active ? 'bg-green-500' : 'bg-[var(--color-ink-3)]'
                      }`}
                    />
                    {distribution.active ? 'Active' : 'Inactive / cancelled'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
                  Distributor
                </span>
                <p className="mt-0.5 font-mono text-[13px] text-[var(--color-ink)]">
                  {distribution.distributor.slice(0, 6)}…{distribution.distributor.slice(-4)}
                </p>
              </div>
              <div>
                <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
                  Created
                </span>
                <p className="mt-0.5 font-mono text-[13px] text-[var(--color-ink)]">
                  {formatTime(distribution.createdAt)}
                </p>
              </div>
              <div>
                <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
                  Token
                </span>
                <p className="mt-0.5 font-mono text-[13px] text-[var(--color-ink)]">
                  {distribution.token.slice(0, 6)}…{distribution.token.slice(-4)}
                </p>
              </div>
              <div>
                <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
                  Recipients
                </span>
                <p className="mt-0.5 font-mono text-[13px] text-[var(--color-ink)]">
                  {distribution.recipientCount}
                </p>
              </div>
            </div>
          </div>

          {/* Vesting info */}
          {vestingInfo && vestingInfo.status !== 'none' && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-4">
              <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--color-ink-3)]">
                VESTING
              </span>
              <p className="mt-1 font-mono text-[13px] text-[var(--color-ink)]">
                {vestingInfo.label}
              </p>
              {vestingInfo.progress !== null && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-cream)]">
                  <div
                    className="h-full rounded-full bg-[var(--color-ink)] transition-all duration-500"
                    style={{ width: `${vestingInfo.progress}%` }}
                  />
                </div>
              )}
              {distribution.vestingCliff > 0 && (
                <p className="mt-1 font-mono text-[11px] text-[var(--color-ink-3)]">
                  Cliff: {Math.round(distribution.vestingCliff / 86400)} days
                  {distribution.vestingLinear > 0
                    ? ` · Linear: ${Math.round(distribution.vestingLinear / 86400)} days`
                    : ''}
                </p>
              )}
            </div>
          )}

          {/* Connect wallet gate */}
          {!isConnected && (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-8 text-center">
              <p className="text-[15px] text-[var(--color-ink-2)]">
                Connect your wallet to view and claim your allocation.
              </p>
              <Link
                href="/console"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-[13px] font-medium text-[var(--color-cream)]"
              >
                Connect wallet →
              </Link>
            </div>
          )}

          {/* Connected wallet */}
          {isConnected && (
            <>
              {/* Not a recipient */}
              {!allocLoading && encAllocation !== undefined && !isRecipient && !isClaimed && (
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-8 text-center">
                  <p className="text-[15px] text-[var(--color-ink-2)]">
                    Your wallet does not have an allocation in this distribution.
                  </p>
                  <p className="mt-1 font-mono text-[12px] text-[var(--color-ink-3)]">
                    {address?.slice(0, 6)}…{address?.slice(-4)}
                  </p>
                </div>
              )}

              {/* Already claimed */}
              {isClaimed && (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-6 py-5 text-center">
                  <p className="font-display text-[18px] font-light text-green-800">✓ Claimed</p>
                  <p className="mt-1 font-mono text-[12px] text-green-600">
                    You have already claimed your allocation from this distribution.
                  </p>
                </div>
              )}

              {/* Recipient flow */}
              {isRecipient && !isClaimed && distribution.active && (
                <div className="grid gap-6">
                  {/* Allocation card */}
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
                    <ConfidentialAmount
                      label="Your allocation"
                      value={null}
                      isLoading={allocLoading}
                      symbol="cToken"
                      onReveal={() => {
                        if (
                          !encAllocation ||
                          encAllocation ===
                            '0x0000000000000000000000000000000000000000000000000000000000000000'
                        ) {
                          void handleRequestPermit()
                        }
                      }}
                    />
                    <p className="mt-3 text-[13px] leading-snug text-[var(--color-ink-2)]">
                      Your allocation is encrypted on-chain. Click <strong>Reveal</strong> to
                      request a decrypt permit via{' '}
                      <code className="font-mono">requestDecryptPermit({distId})</code> — one
                      EIP-712 signature, and only your amount decrypts in your browser.
                    </p>
                  </div>

                  {/* Request decrypt permit */}
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-4">
                    <h3 className="font-display text-[16px] font-light tracking-tight text-[var(--color-ink)]">
                      Step 1: Request Decrypt Permit
                    </h3>
                    <p className="mt-1 text-[13px] leading-snug text-[var(--color-ink-2)]">
                      Grants <code className="font-mono">FHE.allow</code> on your allocation so you
                      can decrypt via EIP-712. Required before you can see or claim your amount.
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleRequestPermit()}
                      disabled={permitting || permitConfirming}
                      className="mt-3 rounded-lg bg-[var(--color-ink)] px-4 py-2 text-[13px] font-medium text-[var(--color-cream)] transition-all hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                    >
                      {permitting || permitConfirming ? 'Requesting…' : 'Request decrypt permit'}
                    </button>
                  </div>

                  {/* Claim */}
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-4">
                    <h3 className="font-display text-[16px] font-light tracking-tight text-[var(--color-ink)]">
                      Step 2: Claim
                    </h3>
                    <p className="mt-1 text-[13px] leading-snug text-[var(--color-ink-2)]">
                      Enter the amount you want to claim. The amount is re-encrypted client-side and
                      verified against your allocation via FHE comparison — never decrypted
                      on-chain.
                    </p>
                    <div className="mt-3">
                      <FheInput
                        label="Claim amount"
                        symbol="cToken"
                        isPending={claiming || claimConfirming || !!actionStatus}
                        onConfirm={amt => {
                          setClaimAmount(amt)
                          void handleClaim()
                        }}
                      />
                    </div>
                    {vestingInfo && vestingInfo.status === 'cliff' && (
                      <p className="mt-2 font-mono text-[12px] text-amber-600">
                        ⏳ Cliff period not yet reached — claiming will revert.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Inactive distribution */}
              {distribution !== null && !distribution.active && isRecipient && !isClaimed && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
                  <p className="font-mono text-[13px] text-amber-700">
                    This distribution has been cancelled by the distributor.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Status & error messages */}
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
                  AnimaDisperse
                </h4>
                <p className="mt-0.5 font-mono text-[11px] text-[var(--color-ink-3)]">
                  {ANIMA_DISPERSE_ADDRESS}
                </p>
              </div>
              <Link
                href={`https://sepolia.etherscan.io/address/${ANIMA_DISPERSE_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[12px] text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)]"
              >
                Etherscan ↗
              </Link>
            </div>
          </div>

          <Link
            href="/disperse"
            className="inline-flex items-center gap-1 font-mono text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"
          >
            ← Back to Disperse
          </Link>
        </div>
      )}
    </main>
  )
}
