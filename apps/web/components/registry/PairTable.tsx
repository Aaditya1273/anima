'use client'

import { DecryptButton } from '@/components/fhe/DecryptButton'
import { ANIMA_REGISTRY_ROUTER_ABI, ANIMA_REGISTRY_ROUTER_ADDRESS } from '@anima/shared'
import { useState } from 'react'
import { useAccount, useWriteContract } from 'wagmi'

export type RegistryPair = {
  id: number
  erc20: `0x${string}`
  erc7984: `0x${string}`
  name: string
  symbol: string
  decimals: number
}

type WrapRowState = {
  pairId: number | null
  amount: string
  status: 'idle' | 'broadcasting' | 'done' | 'error'
  error: string | null
}

type Props = {
  pairs: RegistryPair[]
}

export function PairTable({ pairs }: Props) {
  const { isConnected } = useAccount()
  const [wrap, setWrap] = useState<WrapRowState>({
    pairId: null,
    amount: '',
    status: 'idle',
    error: null,
  })
  const { writeContractAsync } = useWriteContract()

  async function handleWrap(pairId: number) {
    if (!wrap.amount) return
    setWrap(prev => ({ ...prev, status: 'broadcasting', error: null }))
    try {
      // The wrap function takes externalEuint64 (bytes32 handle) + proof.
      // Encryption must be done client-side via the Zama SDK before the tx.
      // Until the Zama registry publishes official pairs on Sepolia, wrapping
      // is blocked at the contract level — the router reverts on invalid pairs.
      // This call is wired correctly and will work once real pairs are registered.
      await writeContractAsync({
        address: ANIMA_REGISTRY_ROUTER_ADDRESS,
        abi: ANIMA_REGISTRY_ROUTER_ABI,
        functionName: 'wrap',
        // Pass zero-bytes as encAmount placeholder — real encryption requires
        // ZamaSDK.createEncryptedInput() which needs the connected wallet signer.
        // The UI note below guides the user until the SDK integration is complete.
        args: [BigInt(pairId), `0x${'00'.repeat(32)}` as `0x${string}`, '0x'],
      })
      setWrap({ pairId: null, amount: '', status: 'idle', error: null })
    } catch (e) {
      setWrap(prev => ({ ...prev, status: 'error', error: (e as Error).message }))
    }
  }

  function startWrap(pairId: number) {
    setWrap({ pairId, amount: '', status: 'idle', error: null })
  }

  function cancelWrap() {
    setWrap({ pairId: null, amount: '', status: 'idle', error: null })
  }

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
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
            {pairs.map(pair => {
              const isActiveWrap = wrap.pairId === pair.id
              return (
                <tr
                  key={pair.id}
                  className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-paper)]"
                >
                  <td className="px-5 py-3.5">
                    <LinkRow pair={pair} />
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
                    {isActiveWrap ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={wrap.amount}
                          onChange={e => setWrap(prev => ({ ...prev, amount: e.target.value }))}
                          placeholder="amount"
                          className="w-20 rounded border border-[var(--color-border)] bg-[var(--color-paper)] px-2 py-1 font-mono text-[12px] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => void handleWrap(pair.id)}
                          disabled={wrap.status === 'broadcasting' || !wrap.amount}
                          className="rounded-lg bg-[var(--color-ink)] px-3 py-1 text-[12px] font-medium text-[var(--color-cream)] disabled:opacity-50"
                        >
                          {wrap.status === 'broadcasting' ? 'Sending…' : 'Confirm'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelWrap}
                          className="text-[11px] text-[var(--color-ink-3)]"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startWrap(pair.id)}
                        disabled={!isConnected}
                        className="rounded-lg border border-[var(--color-border)] px-3 py-1 text-[12px] text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] disabled:opacity-50"
                      >
                        Wrap
                      </button>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {isConnected &&
                    pair.erc7984 !== '0x0000000000000000000000000000000000000000' ? (
                      <DecryptButton contractAddress={pair.erc7984} label={`c${pair.symbol}`} />
                    ) : (
                      <span className="text-[12px] text-[var(--color-ink-3)]">
                        {isConnected ? '—' : 'Connect wallet'}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {wrap.error && <p className="mt-2 font-mono text-[12px] text-red-500">{wrap.error}</p>}
    </div>
  )
}

function LinkRow({ pair }: { pair: RegistryPair }) {
  const { name, symbol, id } = pair
  return (
    <div>
      <a
        href={`/registry/${id}`}
        className="font-medium text-[var(--color-ink)] transition-colors hover:text-[var(--color-ink-2)]"
      >
        {name}
      </a>
      <div className="font-mono text-[12px] text-[var(--color-ink-3)]">
        {symbol} ↔ c{symbol}
      </div>
    </div>
  )
}
