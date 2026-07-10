'use client'

import { ConfidentialAmount } from '@/components/fhe/ConfidentialAmount'
import { ShieldBadge } from '@/components/fhe/ConfidentialAmount'
import { FheInput } from '@/components/fhe/FheInput'
import { useConfidentialBalance, useShield, useConfidentialTransfer, useEncrypt } from '@zama-fhe/react-sdk'
import { matchZamaError } from '@zama-fhe/sdk'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useState } from 'react'
import Link from 'next/link'
import { ANIMA_PAYROLL_ADDRESS, ZAMA_WRAPPERS_REGISTRY_ADDRESS } from '@anima/shared'
import { ANIMA_PAYROLL_ABI } from '@anima/shared'

type Role = 'cfo' | 'employee' | 'auditor'

const USDC_SEPOLIA = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as `0x${string}`

const REGISTRY_ABI_GET_PAIR_BY_ERC20 = [{
  type: 'function' as const,
  name: 'getPairByERC20',
  stateMutability: 'view' as const,
  inputs: [{ type: 'address', name: 'erc20' }],
  outputs: [{
    type: 'tuple',
    components: [
      { type: 'address', name: 'erc20' },
      { type: 'address', name: 'erc7984' },
      { type: 'string',  name: 'name' },
      { type: 'string',  name: 'symbol' },
      { type: 'uint8',   name: 'decimals' },
    ],
  }],
}]

const ROLES: { key: Role; label: string; icon: string; desc: string }[] = [
  { key: 'cfo',      label: 'CFO / Employer',  icon: '◈', desc: 'Deposit salary, grant observer access, manage the full payroll lifecycle' },
  { key: 'employee', label: 'Employee',         icon: '◇', desc: 'View and withdraw your encrypted salary balance' },
  { key: 'auditor',  label: 'Auditor / Regulator', icon: '○', desc: 'Decrypt balances you have been granted access to' },
]

export default function PayrollViewsPage() {
  const { address, isConnected } = useAccount()
  const [role, setRole] = useState<Role>('employee')
  const [employeeAddr, setEmployeeAddr] = useState('')
  const [observerAddr, setObserverAddr] = useState('')
  const [txError, setTxError] = useState<string | null>(null)
  const [earning, setEarning] = useState(false)

  // ── Encrypted balance ──────────────────────────────────────────────────────
  const { data: balance, isLoading: balanceLoading, error: balanceError, refetch: refetchBalance } = useConfidentialBalance({
    address: ANIMA_PAYROLL_ADDRESS,
    account: address,
  })

  const balanceErrorMsg = balanceError
    ? matchZamaError(balanceError, {
        SIGNING_REJECTED: () => 'Wallet signature rejected.',
        KEYPAIR_EXPIRED:  () => 'Decrypt permit expired — sign again.',
        _: (e: unknown) => (e instanceof Error ? e.message : 'Unknown error'),
      })
    : null

  // ── Read cUSDC wrapper from registry ──────────────────────────────────────
  const { data: registryPair } = useReadContract({
    address: ZAMA_WRAPPERS_REGISTRY_ADDRESS,
    abi: REGISTRY_ABI_GET_PAIR_BY_ERC20,
    functionName: 'getPairByERC20',
    args: [USDC_SEPOLIA],
    query: { enabled: ZAMA_WRAPPERS_REGISTRY_ADDRESS !== '0x0000000000000000000000000000000000000000' },
  })

  const regPair = registryPair as { erc20: `0x${string}`; erc7984: `0x${string}`; name: string; symbol: string; decimals: number } | undefined
  const cusdcWrapper = regPair?.erc7984

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { mutateAsync: shield, isPending: shielding } = useShield({ address: cusdcWrapper ?? '0x0000000000000000000000000000000000000000' })
  const { mutateAsync: transfer, isPending: transferring } = useConfidentialTransfer({ address: cusdcWrapper ?? '0x0000000000000000000000000000000000000000' })
  const { mutateAsync: encryptAmount } = useEncrypt()
  const { writeContractAsync, data: grantTxHash, isPending: granting } = useWriteContract()
  const { isLoading: grantConfirming } = useWaitForTransactionReceipt({ hash: grantTxHash })

  const isPending = shielding || transferring || granting || grantConfirming || earning

  // ── Handlers ────────────────────────────────────────────────────────────────
  async function handleGrantObserver() {
    if (!observerAddr.startsWith('0x')) return
    setTxError(null)
    try {
      await writeContractAsync({ address: ANIMA_PAYROLL_ADDRESS, abi: ANIMA_PAYROLL_ABI, functionName: 'grantObserver', args: [observerAddr as `0x${string}`, true] })
      setObserverAddr('')
    } catch (e) { setTxError((e as Error).message) }
  }

  async function handlePaySalary(rawAmount: string) {
    if (!employeeAddr.startsWith('0x') || !rawAmount || !address) return
    setTxError(null)
    try {
      // 1. Shield public ERC-20 → cToken (goes to CFO's wallet)
      await shield({ amount: BigInt(Math.floor(Number(rawAmount) * 1e6)) })

      // 2. Confidential transfer to employee — actual token movement
      await transfer({ to: employeeAddr as `0x${string}`, amount: BigInt(Math.floor(Number(rawAmount) * 1e6)) })

      // 3. Record encrypted salary in AnimaPayroll for compliance
      if (cusdcWrapper) {
        const enc = await encryptAmount({
          values: [{ value: BigInt(Math.floor(Number(rawAmount) * 1e6)), type: 'euint64' }],
          contractAddress: ANIMA_PAYROLL_ADDRESS,
          userAddress: address,
        })
        await writeContractAsync({
          address: ANIMA_PAYROLL_ADDRESS,
          abi: ANIMA_PAYROLL_ABI,
          functionName: 'paySalary',
          args: [cusdcWrapper, employeeAddr as `0x${string}`, enc.encryptedValues[0] as `0x${string}`, enc.inputProof],
        })
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Unknown error')
      setTxError(matchZamaError(err, { SIGNING_REJECTED: () => 'Wallet signature rejected.', TRANSACTION_REVERTED: () => 'Transaction reverted — check balance and allowance.', _: (error: unknown) => (error instanceof Error ? error.message : 'Unknown error') }) ?? err.message)
    }
  }

  async function handleWithdraw(rawAmount: string) {
    if (!rawAmount || !address || !cusdcWrapper) return
    setTxError(null)
    try {
      const enc = await encryptAmount({ values: [{ value: BigInt(Math.floor(Number(rawAmount) * 1e6)), type: 'euint64' }], contractAddress: ANIMA_PAYROLL_ADDRESS, userAddress: address })
      await writeContractAsync({ address: ANIMA_PAYROLL_ADDRESS, abi: ANIMA_PAYROLL_ABI, functionName: 'withdraw', args: [cusdcWrapper, enc.encryptedValues[0] as `0x${string}`, enc.inputProof] })
    } catch (e) { setTxError(e instanceof Error ? e.message : 'Withdraw failed') }
  }

  async function handleEarnYield(rawAmount: string) {
    if (!rawAmount || !address || !cusdcWrapper) return
    setTxError(null)
    setEarning(true)
    try {
      const enc = await encryptAmount({ values: [{ value: BigInt(Math.floor(Number(rawAmount) * 1e6)), type: 'euint64' }], contractAddress: ANIMA_PAYROLL_ADDRESS, userAddress: address })
      // earnYield moves balance to yield sub-account (internal FHE accounting).
      // A live yield vault address should replace the zero address once
      // an external ERC-7984 yield vault is deployed.
      await writeContractAsync({ address: ANIMA_PAYROLL_ADDRESS, abi: ANIMA_PAYROLL_ABI, functionName: 'earnYield', args: [cusdcWrapper, '0x0000000000000000000000000000000000000000' as `0x${string}`, enc.encryptedValues[0] as `0x${string}`, enc.inputProof] })
    } catch (e) { setTxError(e instanceof Error ? e.message : 'Yield deposit failed') }
    finally { setEarning(false) }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 pb-32 pt-28">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="kicker">BUILDER TRACK · ROLE VIEWS</span>
            <ShieldBadge />
          </div>
          <h1 className="mt-3 font-display text-[clamp(34px,4vw,56px)] font-light leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]" style={{ fontVariationSettings: '"opsz" 96, "SOFT" 30, "WONK" 0' }}>
            Payroll Views
          </h1>
          <p className="mt-3 max-w-[52ch] text-[15.5px] leading-[1.65] text-[var(--color-ink-2)]">
            Dedicated dashboards for each payroll role. Switch views to see your specific actions.
          </p>
        </div>
        <Link href="/payroll" className="hidden shrink-0 rounded-lg border border-[var(--color-border)] px-4 py-2 text-[13px] text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] sm:inline-flex">
          ← Back to Payroll
        </Link>
      </div>

      {/* Role selector */}
      <div className="mt-8 flex flex-wrap gap-2">
        {ROLES.map(r => (
          <button key={r.key} type="button" onClick={() => setRole(r.key)}
            className={`rounded-full px-5 py-2.5 text-[13px] font-medium tracking-tight transition-all ${
              role === r.key
                ? 'bg-[var(--color-ink)] text-[var(--color-cream)]'
                : 'border border-[var(--color-border-strong)] text-[var(--color-ink-2)] hover:text-[var(--color-ink)]'
            }`}
          >
            {r.icon} {r.label}
          </button>
        ))}
      </div>
      <p className="mt-2 font-mono text-[12px] text-[var(--color-ink-3)]">{ROLES.find(r => r.key === role)?.desc}</p>

      {!isConnected ? (
        <div className="mt-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-8 text-center">
          <p className="text-[15px] text-[var(--color-ink-2)]">Connect your wallet to interact with the confidential payroll vault.</p>
          <Link href="/console" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-[13px] font-medium text-[var(--color-cream)]">Connect wallet →</Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Balance card — shared across all roles */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
              <ConfidentialAmount
                label={role === 'cfo' ? 'Total payroll (encrypted aggregate)' : `Your salary balance`}
                value={balance !== undefined && balance !== null ? balance.toString() : null}
                isLoading={balanceLoading}
                symbol="cUSDC"
                onReveal={() => void refetchBalance()}
              />
              {balanceErrorMsg && <p className="mt-2 font-mono text-[11px] text-red-500">{balanceErrorMsg}</p>}

              {/* Employee withdraw */}
              {role === 'employee' && balance !== undefined && balance !== null && (
                <div className="mt-4"><FheInput label="Withdraw amount" symbol="cUSDC" isPending={isPending} onConfirm={amt => void handleWithdraw(amt)} /></div>
              )}

              {/* Employee earn yield */}
              {role === 'employee' && balance !== undefined && balance !== null && cusdcWrapper && (
                <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                  <p className="mb-2 text-[13px] text-[var(--color-ink-2)]">Deposit into yield sub-account to earn yield while keeping your balance encrypted.</p>
                  <FheInput label="Amount to earn yield on" symbol="cUSDC" isPending={earning} onConfirm={amt => void handleEarnYield(amt)} />
                </div>
              )}
            </div>

            {/* CFO actions */}
            {role === 'cfo' && (
              <>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
                  <h3 className="font-display text-[18px] font-light tracking-tight text-[var(--color-ink)]">Pay salary</h3>
                  {cusdcWrapper ? (
                    <>
                      <p className="mt-1 text-[13px] text-[var(--color-ink-2)]">Amount encrypted via <code className="font-mono">@zama-fhe/react-sdk</code>.</p>
                      <div className="mt-4 space-y-3">
                        <FheInput label="Employee address" placeholder="0x..." type="text" onConfirm={addr => setEmployeeAddr(addr)} />
                        <FheInput label="Salary amount" symbol="cUSDC" isPending={shielding || transferring} onConfirm={amt => void handlePaySalary(amt)} />
                      </div>
                    </>
                  ) : (
                    <p className="mt-2 text-[13px] leading-[1.55] text-[var(--color-ink-3)]">Requires cUSDC wrapper from Zama registry. No USDC pair deployed yet.</p>
                  )}
                </div>

                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
                  <h3 className="font-display text-[18px] font-light tracking-tight text-[var(--color-ink)]">Grant Auditor Access</h3>
                  <p className="mt-1 text-[13px] text-[var(--color-ink-2)]">Calls <code className="font-mono">grantObserver(address, true)</code>. Auditor receives <code className="font-mono">FHE.allow</code> on all future salary payments.</p>
                  <div className="mt-4">
                    <FheInput label="Observer / auditor address" placeholder="0x..." type="text" isPending={granting || grantConfirming} onConfirm={addr => { setObserverAddr(addr); void handleGrantObserver() }} />
                  </div>
                  {grantTxHash && (
                    <Link href={`https://sepolia.etherscan.io/tx/${grantTxHash}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 font-mono text-[12px] text-[var(--color-ink-2)] underline-offset-2 hover:underline">
                      {grantTxHash.slice(0, 12)}… ↗
                    </Link>
                  )}
                </div>
              </>
            )}

            {/* Auditor decrypt */}
            {role === 'auditor' && (
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6">
                <h3 className="font-display text-[18px] font-light tracking-tight text-[var(--color-ink)]">Auditor Panel</h3>
                <p className="mt-2 text-[13px] leading-[1.55] text-[var(--color-ink-2)]">
                  As an auditor, you can decrypt any employee balance where the CFO has granted you observer access.
                  The CFO calls <code className="font-mono">grantObserver(auditor, true)</code> which emits an <code className="font-mono">FHE.allow</code> on all future salary payments.
                </p>
                <p className="mt-4 text-[13px] text-[var(--color-ink-3)]">
                  Use the Reveal button above to decrypt your permitted balances via EIP-712. Each decryption requires one wallet signature — subsequent reads reuse the cached permit.
                </p>
              </div>
            )}
          </div>

          {/* Right info column */}
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5">
              <h4 className="font-display text-[15px] font-medium text-[var(--color-ink)]">{role === 'cfo' ? 'How it works' : role === 'employee' ? 'Your salary' : 'Audit access'}</h4>
              <p className="mt-1 text-[13px] leading-[1.55] text-[var(--color-ink-2)]">
                {role === 'cfo'
                  ? 'Shield USDC → cUSDC wrapper, then confidential-transfer to employee. Amount is FHE-encrypted before the tx reaches the chain. The contract never sees a plaintext salary figure.'
                  : role === 'employee'
                    ? 'Only you can decrypt your balance. The contract verifies balance ≥ amount via FHE.lte without revealing either value. You can also deposit into the yield sub-account.'
                    : 'The CFO grants you FHE.allow via grantObserver(). You can decrypt employee balances via EIP-712 at any time — useful for compliance and reporting.'}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-5">
              <h4 className="font-display text-[15px] font-medium text-[var(--color-ink)]">Contract</h4>
              <Link href={`https://sepolia.etherscan.io/address/${ANIMA_PAYROLL_ADDRESS}`} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 font-mono text-[13px] text-[var(--color-ink-2)] underline-offset-2 hover:text-[var(--color-ink)] hover:underline">
                AnimaPayroll.sol ↗
              </Link>
              <div className="mt-1 font-mono text-[11px] text-[var(--color-ink-3)]">{ANIMA_PAYROLL_ADDRESS}</div>
            </div>

            {txError && <div className="rounded-xl border border-red-200 bg-red-50 p-4"><p className="font-mono text-[12px] text-red-600">{txError}</p></div>}
          </div>
        </div>
      )}
    </main>
  )
}
