'use client'

import { ShieldBadge, ConfidentialAmount } from '@/components/fhe/ConfidentialAmount'
import { FheInput } from '@/components/fhe/FheInput'
import { useConfidentialBalance, useEncrypt } from '@zama-fhe/react-sdk'
import { matchZamaError } from '@zama-fhe/sdk'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useState } from 'react'
import Link from 'next/link'
import { ANIMA_PAYROLL_ADDRESS, ZAMA_WRAPPERS_REGISTRY_ADDRESS } from '@anima/shared'
import { ANIMA_PAYROLL_ABI } from '@anima/shared'

const USDC_SEPOLIA = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as `0x${string}`

const REGISTRY_ABI_GET_PAIR = [{
  type: 'function' as const, name: 'getPairByERC20', stateMutability: 'view' as const,
  inputs: [{ type: 'address', name: 'erc20' }],
  outputs: [{ type: 'tuple', components: [
    { type: 'address', name: 'erc20' }, { type: 'address', name: 'erc7984' },
    { type: 'string', name: 'name' }, { type: 'string', name: 'symbol' }, { type: 'uint8', name: 'decimals' },
  ]}],
}]

export default function EarnYieldPage() {
  const { address, isConnected } = useAccount()
  const [depositAmt, setDepositAmt] = useState('')
  const [withdrawAmt, setWithdrawAmt] = useState('')
  const [txError, setTxError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const { data: balance, isLoading: balLoading, error: balError, refetch: refetchBalance } = useConfidentialBalance({
    address: ANIMA_PAYROLL_ADDRESS, account: address,
  })

  const { data: yieldBal, isLoading: yieldLoading, refetch: refetchYield } = useConfidentialBalance({
    address: ANIMA_PAYROLL_ADDRESS, account: address,
  })

  const balErrMsg = balError ? matchZamaError(balError, {
    SIGNING_REJECTED: () => 'Wallet signature rejected.',
    KEYPAIR_EXPIRED: () => 'Decrypt permit expired — sign again.',
    _: (e: unknown) => (e instanceof Error ? e.message : 'Unknown error'),
  }) : null

  const { data: regPair } = useReadContract({
    address: ZAMA_WRAPPERS_REGISTRY_ADDRESS, abi: REGISTRY_ABI_GET_PAIR,
    functionName: 'getPairByERC20', args: [USDC_SEPOLIA],
    query: { enabled: ZAMA_WRAPPERS_REGISTRY_ADDRESS !== '0x0000000000000000000000000000000000000000' },
  })
  const pair = regPair as { erc7984: `0x${string}` } | undefined
  const wrapper = pair?.erc7984

  const { mutateAsync: encryptAmount } = useEncrypt()
  const { writeContractAsync } = useWriteContract()

  // ── Yield sub-account interaction ─────────────────────────────────────────
  //     The earnYield() / withdrawYield() functions move shielded balance between
  //     the main _salaries mapping and a separate _yieldBalances sub-account.
  //     This is internal FHE accounting — the balance stays encrypted throughout.
  //     A future upgrade could route these calls to an external yield vault
  //     that accepts ERC-7984 handle deposits.

  async function handleDeposit() {
    if (!depositAmt || !address || !wrapper) return
    setTxError(null); setPending(true)
    try {
      const enc = await encryptAmount({
        values: [{ value: BigInt(Math.floor(Number(depositAmt) * 1e6)), type: 'euint64' }],
        contractAddress: ANIMA_PAYROLL_ADDRESS, userAddress: address,
      })
      // earnYield moves balance from main account to yield sub-account
      // (internal FHE accounting — separate tracking balance, same contract)
      await writeContractAsync({
        address: ANIMA_PAYROLL_ADDRESS, abi: ANIMA_PAYROLL_ABI,
        functionName: 'earnYield',
        args: [wrapper, '0x0000000000000000000000000000000000000000' as `0x${string}`, enc.encryptedValues[0] as `0x${string}`, enc.inputProof],
      })
      setDepositAmt(''); void refetchYield()
    } catch (e) { setTxError(e instanceof Error ? e.message : 'Deposit failed') }
    finally { setPending(false) }
  }

  async function handleWithdraw() {
    if (!withdrawAmt || !address || !wrapper) return
    setTxError(null); setPending(true)
    try {
      const enc = await encryptAmount({
        values: [{ value: BigInt(Math.floor(Number(withdrawAmt) * 1e6)), type: 'euint64' }],
        contractAddress: ANIMA_PAYROLL_ADDRESS, userAddress: address,
      })
      await writeContractAsync({
        address: ANIMA_PAYROLL_ADDRESS, abi: ANIMA_PAYROLL_ABI,
        functionName: 'withdrawYield',
        args: [wrapper, '0x0000000000000000000000000000000000000000' as `0x${string}`, enc.encryptedValues[0] as `0x${string}`, enc.inputProof],
      })
      setWithdrawAmt(''); void refetchBalance()
    } catch (e) { setTxError(e instanceof Error ? e.message : 'Withdraw failed') }
    finally { setPending(false) }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 pb-32 pt-28">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="kicker">BUILDER TRACK · COMPOSABLE YIELD</span>
            <ShieldBadge />
          </div>
          <h1 className="mt-3 font-display text-[clamp(34px,4vw,56px)] font-light leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]" style={{ fontVariationSettings: '"opsz" 96, "SOFT" 30, "WONK" 0' }}>
            Earn Confidential Yield
          </h1>
          <p className="mt-3 max-w-[52ch] text-[15.5px] leading-[1.65] text-[var(--color-ink-2)]">
            Move your shielded salary into a separate yield tracking sub-account.
            Your balance stays FHE-encrypted while accruing — never revealed to the chain.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
        <h2 className="font-display text-[20px] font-light tracking-tight text-[var(--color-ink)]">How it works</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] p-4">
            <div className="font-display text-[28px] font-light text-[var(--color-ink)]">1</div>
            <p className="mt-1 text-[13px] leading-snug text-[var(--color-ink-2)]">Shield your salary via confidential transfer. Amount encrypted client-side.</p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] p-4">
            <div className="font-display text-[28px] font-light text-[var(--color-ink)]">2</div>
            <p className="mt-1 text-[13px] leading-snug text-[var(--color-ink-2)]">Move encrypted balance into yield sub-account via <code className="font-mono">earnYield()</code>. Internal FHE accounting — separate tracking balance within the same contract.</p>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-cream)] p-4">
            <div className="font-display text-[28px] font-light text-[var(--color-ink)]">3</div>
            <p className="mt-1 text-[13px] leading-snug text-[var(--color-ink-2)]">Withdraw anytime. Balance stays encrypted across the full deposit → yield → withdraw cycle.</p>
          </div>
        </div>
      </div>

      {!isConnected ? (
        <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-8 text-center">
          <p className="text-[15px] text-[var(--color-ink-2)]">Connect your wallet to manage yield positions.</p>
          <Link href="/console" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-[13px] font-medium text-[var(--color-cream)]">Connect wallet →</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6">
          {/* Balance card */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
            <ConfidentialAmount label="Your shielded salary balance" value={balance !== undefined && balance !== null ? balance.toString() : null} isLoading={balLoading} symbol="cUSDC" onReveal={() => void refetchBalance()} />
            {balErrMsg && <p className="mt-2 font-mono text-[11px] text-red-500">{balErrMsg}</p>}
            {wrapper ? (
              <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                <FheInput label="Deposit into yield sub-account" symbol="cUSDC" isPending={pending} onConfirm={amt => { setDepositAmt(amt); void handleDeposit() }} />
              </div>
            ) : (
              <p className="mt-4 text-[13px] text-[var(--color-ink-3)]">Yield deposits require a cUSDC wrapper from the Zama registry. No USDC pair deployed yet.</p>
            )}
          </div>

          {/* Yield balance */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
            <ConfidentialAmount label="Yield position (internal sub-account)" value={yieldBal !== undefined && yieldBal !== null ? yieldBal.toString() : null} isLoading={yieldLoading} symbol="cUSDC" onReveal={() => void refetchYield()} />
            {yieldBal !== undefined && yieldBal !== null && wrapper && (
              <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                <FheInput label="Withdraw from yield sub-account" symbol="cUSDC" isPending={pending} onConfirm={amt => { setWithdrawAmt(amt); void handleWithdraw() }} />
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5">
            <h4 className="font-display text-[15px] font-medium text-[var(--color-ink)]">Yield sub-account</h4>
            <p className="mt-1 text-[13px] leading-[1.55] text-[var(--color-ink-2)]">
              <strong className="font-medium text-[var(--color-ink)]">Internal FHE accounting</strong><br />
              The <code className="font-mono">earnYield()</code> function on AnimaPayroll moves your shielded balance from the main salary mapping to a separate
              <code className="font-mono"> _yieldBalances</code> tracking mapping — both encrypted as <code className="font-mono">euint64</code> handles within the same contract.
              This is an internal accounting split, not an external vault call. A future upgrade could route yield sub-account
              balances to an external yield vault that accepts ERC-7984 handle deposits.
            </p>
            {txError && <p className="mt-3 font-mono text-[12px] text-red-500">{txError}</p>}
          </div>

          <Link href="/payroll" className="inline-flex items-center gap-1 font-mono text-[13px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)]">← Back to Payroll</Link>
        </div>
      )}
    </main>
  )
}
