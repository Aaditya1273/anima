'use client'

import { ANIMA_REGISTRY_ROUTER_ABI, ANIMA_REGISTRY_ROUTER_ADDRESS } from '@anima/shared'
import { useState } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import type { RegistryPair } from './PairTable'

type Props = {
  pairs: RegistryPair[]
  isDeployed: boolean
}

export function FaucetPanel({ pairs, isDeployed }: Props) {
  const { isConnected } = useAccount()
  const [faucetPairId, setFaucetPairId] = useState<number | null>(null)
  const { writeContractAsync: faucetWrite, isPending: fauceting } = useWriteContract()

  async function handleFaucet(pairId: number) {
    const pair = pairs.find(p => p.id === pairId)
    if (!pair || pair.erc20 === '0x0000000000000000000000000000000000000000') return
    setFaucetPairId(pairId)
    try {
      await faucetWrite({
        address: ANIMA_REGISTRY_ROUTER_ADDRESS,
        abi: ANIMA_REGISTRY_ROUTER_ABI,
        functionName: 'faucet',
        args: [pair.erc20, 1_000n * 10n ** BigInt(pair.decimals)],
      })
    } catch {
      /* user rejected */
    } finally {
      setFaucetPairId(null)
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
      <h3 className="font-display text-[18px] font-light tracking-tight text-[var(--color-ink)]">
        cTokenMock Faucet
      </h3>
      <p className="mt-2 text-[14px] leading-[1.6] text-[var(--color-ink-2)]">
        Calls <code className="font-mono">AnimaRegistryRouter.faucet(token, 1000e6)</code> — mints
        official Zama-deployed Sepolia cTokenMocks, not a custom mock.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {pairs.map(pair => (
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
  )
}
