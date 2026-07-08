'use client'

import { ConfidentialAmount } from '@/components/fhe/ConfidentialAmount'
import { ShieldBadge } from '@/components/fhe/ConfidentialAmount'
import { FheInput } from '@/components/fhe/FheInput'
import { useConfidentialBalance, useShield, useConfidentialTransfer } from '@zama-fhe/react-sdk'
import { matchZamaError } from '@zama-fhe/sdk'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useState } from 'react'
import Link from 'next/link'
import { ANIMA_PAYROLL_ADDRESS } from '@anima/shared'
import { ANIMA_PAYROLL_ABI } from '@anima/shared'

type Role = 'cfo' | 'employee' | 'auditor'

const ROLE_INFO: Record<Role, { label: string; description: string }> = {
  cfo:     { label: 'CFO / Employer',      description: 'Deposit salary, grant observer access, manage payroll' },
  employee:{ label: 'Employee',            description: 'View and withdraw your own balance' },
  auditor: { label: 'Auditor / Regulator', description: 'Decrypt balances you have been granted access to' },
}

// Sepolia cUSDC wrapper address — update once Zama publishes official pair list
const CUSDC_WRAPPER = ANIMA_PAYROLL_ADDRESS // placeholder until Zama registry live

export default function PayrollPage() {
  const { address, isConnected } = useAccount()
  const [role, setRole]                 = useState<Role>('employee')
  const [employeeAddr, setEmployeeAddr] = useState('')
  const [observerAddr, setObserverAddr] = useState('')
  const [txError, setTxError]           = useState<string | null>(null)

  // ── Real EIP-712 balance decrypt ──────────────────────────────────────────
  const {
    data: balance,
    isLoading: balanceLoading,
    error: balanceError,
    refetch: refetchBalance,
  } = useConfidentialBalance({
    address: ANIMA_PAYROLL_ADDRESS,
    account: address,
  })

  const balanceErrorMsg = balanceError
    ? matchZamaError(balanceError, {
        SIGNING_REJECTED: () => 'Wallet signature rejected.',
        KEYPAIR_EXPIRED:  () => 'Decrypt permit expired — sign again.',
        _: (e: Error) => e.message,
      })
    : null

  // ── Real shield (deposit salary) ─────────────────────────────────────────
  const { mutateAsync: shield, isPending: shielding } = useShield({
    address: CUSDC_WRAPPER,
  })

  // ── Real confidential transfer (pay salary to employee) ──────────────────
  const { mutateAsync: transfer, isPending: transferring } = useConfidentialTransfer({
    address: CUSDC_WRAPPER,
  })

  // ── grantObserver via wagmi writeContract ─────────────────────────────────
  const { writeContractAsync, data: grantTxHash, isPending: granting } = useWriteContract()
  const { isLoading: grantConfirming } = useWaitForTransactionReceipt({ hash: grantTxHash })

  async function handleGrantObserver() {
    if (!observerAddr.startsWith('0x')) return
    setTxError(null)
    try {
      await writeContractAsync({
        address: ANIMA_PAYROLL_ADDRESS,
        abi: ANIMA_PAYROLL_ABI,
        functionName: 'grantObserver',
        args: [observerAddr as `0x${string}`, true],
      })
      setObserverAddr('')
    } catch (e) {
      setTxError((e as Error).message)
    }
  }

  // ── Pay salary (CFO): shield amount then transfer to employee ─────────────
  async function handlePaySalary(rawAmount: string) {
    if (!employeeAddr.startsWith('0x') || !rawAmount) return
    setTxError(null)
    try {
      // 1. Shield public ERC-20 → cToken
      await shield({ amount: BigInt(Math.floor(Number(rawAmount) * 1e6)) })
      // 2. Confidential transfer to employee — amount stays encrypted
      await transfer({
        to: employeeAddr as `0x${string}`,
        amount: BigInt(Math.floor(Number(rawAmount) * 1e6)),
      })
    } catch (e) {
      setTxError(
        matchZamaError(e as Error, {
          SIGNING_REJECTED: () => 'Wallet signature rejected.',
          TRANSACTION_REVERTED: () => 'Transaction reverted — check balance and allowance.',
          _: (err: Error) => err.message,
        }) ?? (e as Error).message,
      )
    }
  }

  // ── Withdraw (employee): confidential transfer back to self ───────────────
  async function handleWithdraw(rawAmount: string) {
    if (!rawAmount || !address) return
    setTxError(null)
    try {
      await writeContractAsync({
        address: ANIMA_PAYROLL_ADDRESS,
        abi: ANIMA_PAYROLL_ABI,
        functionName: 'withdraw',
        // encAmount and proof are supplied by the Zama relayer — wagmi
        // will call the contract after the relayer returns the ciphertext.
        // For now we pass zero-bytes as a placeholder that surfaces the
        // "not deployed" state clearly until contracts are live.
        args: [CUSDC_WRAPPER, `0x${'00'.repeat(32)}` as `0x${string}`, '0x'],
      })
    } catch (e) {
      setTxError((e as Error).message)
    }
  }

  const isPending = shielding || transferring || granting || grantConfirming

  return (
    <main className="mx-auto max-w-5xl px-6 pb-32 pt-28">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="kicker">BUILDER TRACK</span>
            <ShieldBadge />
          </div>
          <h1
            className="mt-3 font-display text-[clamp(34px,4vw,56px)] font-light leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]"
            style={{ fontVariationSettings: '"opsz" 96, "SOFT" 30, "WONK" 0' }}
          >
            Confidential Payroll
          </h1>
          <p className="mt-3 max-w-[52ch] text-[15.5px] leading-[1.65] text-[var(--color-ink-2)]">
            Three roles. One contract. Every salary encrypted on-chain. Powered by{' '}
            <Link
              href="https://docs.zama.ai"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-[var(--color-border-strong)] underline-offset-[3px] hover:decoration-[var(--color-ink)]"
            >
              Zama FHEVM
            </Link>{' '}
            on Ethereum Sepolia.
          </p>
        </div>
        <div className="hidden shrink-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-3 sm:block">
          <div className="font-mono text-[11px] text-[var(--color-ink-3)]">Network</div>
          <div className="mt-0.5 font-mono text-[13px] text-[var(--color-ink)]">Sepolia · 11155111</div>
        </div>
      </div>

      {/* Role switcher */}
      <div className="mt-10 flex flex-wrap gap-2">
        {(Object.entries(ROLE_INFO) as [Role, (typeof ROLE_INFO)[Role]][]).map(([key, info]) => (
          <button
            key={key}
            type="button"
            onClick={() => setRole(key)}
            className={`rounded-full px-5 py-2 text-[13px] font-medium tracking-tight transition-all ${
              role === key
                ? 'bg-[var(--color-ink)] text-[var(--color-cream)]'
                : 'border border-[var(--color-border-strong)] text-[var(--color-ink-2)] hover:text-[var(--color-ink)]'
            }`}
          >
            {info.label}
          </button>
        ))}
      </div>
      <p className="mt-2 font-mono text-[12px] text-[var(--color-ink-3)]">
        {ROLE_INFO[role].description}
      </p>

      {!isConnected ? (
        <div className="mt-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-8 text-center">
          <p className="text-[15px] text-[var(--color-ink-2)]">
            Connect your wallet to interact with the confidential payroll vault.
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
          {/* Left — balance + actions */}
          <div className="space-y-6 lg:col-span-2">

            {/* Encrypted balance — real useConfidentialBalance */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
              <ConfidentialAmount
                label={
                  role === 'cfo'
                    ? 'Total payroll (encrypted aggregate)'
                    : `Your ${ROLE_INFO[role].label.toLowerCase()} balance`
                }
                value={balance !== undefined && balance !== null ? balance.toString() : null}
                isLoading={balanceLoading}
                symbol="cUSDC"
                onReveal={() => void refetchBalance()}
              />
              {balanceErrorMsg && (
                <p className="mt-2 font-mono text-[11px] text-red-500">{balanceErrorMsg}</p>
              )}

              {/* Employee withdraw */}
              {role === 'employee' && balance !== undefined && balance !== null && (
                <div className="mt-4">
                  <FheInput
                    label="Withdraw amount"
                    symbol="cUSDC"
                    isPending={isPending}
                    onConfirm={amt => void handleWithdraw(amt)}
                  />
                </div>
              )}
            </div>

            {/* CFO: employee address + pay salary */}
            {role === 'cfo' && (
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
                <h3 className="font-display text-[18px] font-light tracking-tight text-[var(--color-ink)]">
                  Pay salary
                </h3>
                <p className="mt-1 text-[13px] text-[var(--color-ink-2)]">
                  Amount is encrypted client-side via{' '}
                  <code className="font-mono">@zama-fhe/react-sdk</code> before submission.
                </p>
                <div className="mt-4 space-y-3">
                  <FheInput
                    label="Employee address"
                    placeholder="0x..."
                    type="text"
                    onConfirm={addr => setEmployeeAddr(addr)}
                  />
                  <FheInput
                    label="Salary amount"
                    symbol="cUSDC"
                    isPending={shielding || transferring}
                    onConfirm={amt => void handlePaySalary(amt)}
                  />
                </div>
              </div>
            )}

            {/* CFO: grant observer */}
            {role === 'cfo' && (
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
                <h3 className="font-display text-[18px] font-light tracking-tight text-[var(--color-ink)]">
                  Grant Auditor Access
                </h3>
                <p className="mt-1 text-[13px] text-[var(--color-ink-2)]">
                  Calls{' '}
                  <code className="font-mono">AnimaPayroll.grantObserver(address, true)</code>.
                  The auditor receives{' '}
                  <code className="font-mono">FHE.allow</code> on all future salary payments.
                </p>
                <div className="mt-4">
                  <FheInput
                    label="Observer / auditor address"
                    placeholder="0x..."
                    type="text"
                    isPending={granting || grantConfirming}
                    onConfirm={addr => {
                      setObserverAddr(addr)
                      void handleGrantObserver()
                    }}
                  />
                </div>
                {grantTxHash && (
                  <Link
                    href={`https://sepolia.etherscan.io/tx/${grantTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 font-mono text-[12px] text-[var(--color-ink-2)] underline-offset-2 hover:underline"
                  >
                    {grantTxHash.slice(0, 12)}… ↗
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right — info */}
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5">
              <h4 className="font-display text-[15px] font-medium text-[var(--color-ink)]">
                {role === 'cfo' ? 'How it works' : role === 'employee' ? 'Your salary' : 'Audit access'}
              </h4>
              <p className="mt-1 text-[13px] leading-[1.55] text-[var(--color-ink-2)]">
                {role === 'cfo'
                  ? 'Shield public ERC-20 → cToken, then confidential-transfer to employee. Amount is FHE-encrypted before the tx reaches the chain.'
                  : role === 'employee'
                    ? 'Only you can decrypt your balance. The contract verifies balance ≥ amount via FHE.lte without revealing either value.'
                    : 'The CFO calls grantObserver(auditor, true). You are granted FHE.allow on all employee balances. Decrypt via EIP-712 on demand.'}
              </p>
            </div>

            {/* Composable yield */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5">
              <h4 className="font-display text-[15px] font-medium text-[var(--color-ink)]">
                Composable yield
              </h4>
              <p className="mt-1 text-[13px] leading-[1.55] text-[var(--color-ink-2)]">
                Shield salary → earn yield on Morpho Steakhouse Confidential Prime USDC. Amount stays
                encrypted throughout via{' '}
                <code className="font-mono">earnYield(token, morphoVault, encAmount, proof)</code>.
              </p>
            </div>

            {/* Contract link */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5">
              <h4 className="font-display text-[15px] font-medium text-[var(--color-ink)]">Contract</h4>
              <Link
                href={`https://sepolia.etherscan.io/address/${ANIMA_PAYROLL_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 font-mono text-[13px] text-[var(--color-ink-2)] underline-offset-2 hover:text-[var(--color-ink)] hover:underline"
              >
                AnimaPayroll.sol ↗
              </Link>
              <div className="mt-1 font-mono text-[11px] text-[var(--color-ink-3)]">
                {ANIMA_PAYROLL_ADDRESS === '0x0000000000000000000000000000000000000000'
                  ? 'Deploy pending — run pnpm deploy:sepolia'
                  : ANIMA_PAYROLL_ADDRESS}
              </div>
            </div>

            {txError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="font-mono text-[12px] text-red-600">{txError}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
