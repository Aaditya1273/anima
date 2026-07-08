'use client'

import { useConfidentialBalance } from '@zama-fhe/react-sdk'
import { matchZamaError } from '@zama-fhe/sdk'
import { useAccount } from 'wagmi'
import type { Address } from 'viem'

type Props = {
  /** ERC-7984 token / wrapper contract address to decrypt the balance from */
  contractAddress: Address
  /** Optional label prefix shown before "· Decrypt" */
  label?: string
  /** Called with the decrypted plaintext bigint when successful */
  onDecrypted?: (value: bigint) => void
}

/**
 * DecryptButton — wires the real Zama EIP-712 user-decryption flow.
 *
 * How it works:
 *   1. `useConfidentialBalance` subscribes to the encrypted balance handle from
 *      the on-chain ERC-7984 contract via the Zama relayer.
 *   2. On first call, the relayer asks the wallet for an EIP-712 signature to
 *      generate a decrypt permit. Subsequent calls reuse the cached permit.
 *   3. The relayer decrypts the euint64 handle and returns the plaintext bigint.
 *   4. All decryption happens in the browser — no plaintext reaches the server.
 *
 * The hook is always mounted so the query can prefetch in the background.
 * "Decrypt" button is only rendered when the balance is not yet available.
 */
export function DecryptButton({ contractAddress, label, onDecrypted }: Props) {
  const { address: account } = useAccount()

  const {
    data: balance,
    isLoading,
    error,
    refetch,
  } = useConfidentialBalance({
    address: contractAddress,
    // account is undefined when not connected — hook is a no-op in that case
    account,
  })

  // Fire onDecrypted whenever we receive a new value
  if (balance !== undefined && balance !== null) {
    onDecrypted?.(balance)
  }

  // Map SDK error codes to user-friendly messages
  const errorMessage = error
    ? matchZamaError(error, {
        SIGNING_REJECTED: () => 'Wallet signature rejected — try again.',
        KEYPAIR_EXPIRED: () => 'Decrypt permit expired — sign again to continue.',
        ENCRYPTION_FAILED: () => 'Decryption failed — check your connection.',
        _: (e: unknown) => e instanceof Error ? e.message : 'Unknown error',
      })
    : null

  if (!account) {
    return (
      <span className="font-mono text-[12px] text-[var(--color-ink-3)]">
        Connect wallet
      </span>
    )
  }

  // Balance already decrypted and displayed upstream via onDecrypted
  if (balance !== undefined && balance !== null) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[12px] text-[var(--color-ink)]">
        {balance.toString()}
        <span aria-label="Decrypted" className="text-[14px]">🔓</span>
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => void refetch()}
        disabled={isLoading}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] disabled:cursor-wait disabled:opacity-60"
      >
        {isLoading
          ? 'Decrypting…'
          : `${label ? `${label} · ` : ''}Decrypt`}
      </button>
      {errorMessage ? (
        <span className="font-mono text-[11px] text-red-500">{errorMessage}</span>
      ) : null}
    </div>
  )
}