'use client'

import { SNAPSHOT_TAKEN_AT } from '@/lib/snapshot'

export function Mindmap() {
  const dateStr = new Date(SNAPSHOT_TAKEN_AT).toUTCString().replace('GMT', 'UTC')

  return (
    <div className="space-y-6">
      <div>
        <div className="kicker mb-3">System · Architecture</div>
        <h2 className="font-display text-[44px] font-light leading-[1.02] tracking-[-0.018em] text-[var(--color-ink)]">
          Encrypted, <span className="font-italic-serif italic">proven</span>.
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--color-ink-2)]">
          Three contracts live on Ethereum Sepolia, verified on Etherscan, processing encrypted
          transactions via the Zama FHEVM co-processor.
        </p>
      </div>

      <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-paper)] p-5">
        <div className="font-mono mb-3 flex items-center justify-between text-[10.5px] tracking-[0.04em] text-[var(--color-ink-3)]">
          <span>Deployed Contracts</span>
          <span className="inline-flex items-center gap-1 text-[var(--color-ink)]">
            <span className="block h-1.5 w-1.5 rounded-full bg-[var(--color-ink)]" />
            Sepolia
          </span>
        </div>
        <div className="space-y-2">
          <ContractRow name="AnimaPayroll" desc="Confidential payroll vault" addr="0x86ba…d1cB" />
          <ContractRow name="AnimaRegistryRouter" desc="Wrapper registry router" addr="0x4473…9f83" />
          <ContractRow name="AnimaDisperse" desc="Distribution engine" addr="0xdF68…b61" />
        </div>
        <div className="font-mono mt-3 grid grid-cols-3 gap-2 text-[11px]">
          <Pill label="TVS" value="66.4K USDC" />
          <Pill label="Salaries" value="3 paid" />
          <Pill label="Recipients" value="24 total" />
        </div>
      </div>

      <p className="text-[14px] leading-relaxed text-[var(--color-ink-2)]">
        Every contract is deployed and verified. Not a demo — live on Sepolia.
      </p>
      <p className="font-mono text-[10.5px] tracking-[0.04em] text-[var(--color-ink-3)]">
        ↻ Snapshot · {dateStr}
      </p>
    </div>
  )
}

function ContractRow({ name, desc, addr }: { name: string; desc: string; addr: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-[var(--color-border)] pb-1.5 last:border-0">
      <div>
        <div className="font-display text-[14px] text-[var(--color-ink)]">{name}</div>
        <div className="font-mono text-[10px] text-[var(--color-ink-3)]">{desc}</div>
      </div>
      <span className="font-mono shrink-0 text-[11px] text-[var(--color-ink-2)]">{addr}</span>
    </div>
  )
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-cream)]/55 px-2 py-1 text-center">
      <div className="text-[9px] tracking-[0.04em] text-[var(--color-ink-3)]">{label}</div>
      <div className="text-[11px] text-[var(--color-ink)]">{value}</div>
    </div>
  )
}
