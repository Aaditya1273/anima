/**
 * TokenOps SDK client — @tokenops/sdk (fhe-airdrop subpath)
 *
 * The TokenOps SDK (@tokenops/sdk@1.x) provides a createConfidentialAirdrop
 * flow that encrypts amounts client-side and deploys a confidential airdrop
 * clone via an on-chain factory on Sepolia.
 *
 * Note on architecture: The SDK deploys its own standalone ConfidentalAirdrop
 * clones via the TokenOps factory. It does NOT use AnimaDisperse.sol directly.
 * AnimaDisperse.sol is a separate alternative implementation that stores
 * encrypted allocations internally. The TokenOps SDK integration is a
 * complementary path for users who prefer the TokenOps factory pattern.
 *
 * The SDK is imported lazily. If the SDK or the fhe-airdrop subpath is not
 * available, a descriptive error is thrown so the user knows to install or
 * update @tokenops/sdk.
 *
 * Recipients call the deployed airdrop clone's claim() function directly.
 */

import type { Address, Hex, PublicClient, WalletClient } from 'viem'

// ─── Re-exported types ────────────────────────────────────────────────────────

export type TokenOpsRecipient = {
  address: Address
  /** Plaintext amount — SDK encrypts this client-side before sending on-chain */
  amount: bigint
}

export type VestingSchedule = {
  cliff: number  // seconds
  linear: number // seconds (not used by airdrop factory, reserved for vesting client)
}

export type ConfidentialAirdropParams = {
  /** ERC-7984 wrapper token address */
  token: Address
  recipients: TokenOpsRecipient[]
  vestingSchedule?: VestingSchedule
}

export type DistributionResult = {
  /** Address of the deployed airdrop clone */
  airdropAddress: Address
  /** Deployment transaction hash */
  txHash: `0x${string}`
}

// ─── Lazy factory client ──────────────────────────────────────────────────────

let _factoryPromise: Promise<{
  createConfidentialAirdrop: (opts: {
    params: {
      token: Address
      startTimestamp: number
      endTimestamp: number
      canExtendClaimWindow: boolean
      admin: Address
      recipients: Array<{ account: Address; amount: bigint }>
    }
    userSalt: Hex
    account: Address
  }) => Promise<{ hash: string; airdrop: Address }>
}> | null = null

async function getFactoryClient(
  publicClient: PublicClient,
  walletClient: WalletClient,
) {
  if (!_factoryPromise) {
    _factoryPromise = (async () => {
      try {
        const { createConfidentialAirdropFactoryClient } = await import(
          '@tokenops/sdk/fhe-airdrop'
        )
        return createConfidentialAirdropFactoryClient({
          publicClient,
          walletClient,
        })
      } catch (cause: unknown) {
        throw new Error(
          `TokenOps SDK not available: ${cause instanceof Error ? cause.message : 'dynamic import failed'}. Install with: pnpm add @tokenops/sdk`,
        )
      }
    })()
  }
  return _factoryPromise
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function createConfidentialAirdrop(
  params: ConfidentialAirdropParams,
  publicClient: PublicClient,
  walletClient: WalletClient,
): Promise<DistributionResult> {
  const factory = await getFactoryClient(publicClient, walletClient)

  const now = Math.floor(Date.now() / 1000)
  const [account] = await walletClient.getAddresses()
  const airdropParams = {
    token: params.token,
    startTimestamp: now - 60,
    endTimestamp: now + 30 * 86400,
    canExtendClaimWindow: true,
    admin: account,
    recipients: params.recipients.map(r => ({
      account: r.address,
      amount: r.amount,
    })),
  }

  const userSalt: Hex = `0x${Date.now().toString(16).padStart(64, '0')}` as Hex

  const result = await factory.createConfidentialAirdrop({
    params: airdropParams,
    userSalt,
    account,
  })

  return {
    airdropAddress: result.airdrop as Address,
    txHash: result.hash as `0x${string}`,
  }
}

/**
 * Estimated MEV front-run exposure for a public (unencrypted) distribution.
 * Source: TokenOps data — average ~17% price drawdown within 72h for public drops.
 */
export function estimateMevExposure(totalAmount: bigint): {
  exposedAmount: bigint
  percentage: number
  label: string
} {
  const exposed = (totalAmount * 17n) / 100n
  return {
    exposedAmount: exposed,
    percentage: 0.17,
    label: '~17% estimated front-run within 72h',
  }
}

/** Reset factory singleton — call when wallet disconnects/reconnects */
export function resetTokenOpsClient(): void {
  _factoryPromise = null
}
