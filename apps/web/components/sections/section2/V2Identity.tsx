'use client'

import { CONTRACTS, addressUrl, truncate } from '@/lib/chainscan'
import { CONTRACTS_META, TVS_BREAKDOWN } from '@/lib/snapshot'
import { motion } from 'framer-motion'

const cardEntrance = {
  hidden: { opacity: 0, y: 30, rotate: -0.6 },
  show: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
  },
}

export function V2Identity() {
  return (
    <section
      id="layer-identity"
      className="relative flex min-h-screen items-center py-[var(--section-py)]"
    >
      <div className="mx-auto w-full max-w-[var(--container-wrap)] px-6 sm:px-8">
        <LayerHeader title="Payroll" pill="Sepolia · AnimaPayroll" idx="01" />
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[clamp(36px,5vw,68px)] font-light leading-[1.04] tracking-[-0.018em] text-[var(--color-ink)]"
            >
              Salaries <span className="font-italic-serif italic">encrypted</span>, not exposed.
            </motion.h2>
            <p className="max-w-md text-[15px] leading-relaxed text-[var(--color-ink-2)]">
              Every salary in AnimaPayroll is an euint64 handle on Ethereum Sepolia. The CFO pays
              employees without ever revealing the amount on-chain. FHE arithmetic handles
              deposits, withdrawals, and yield composability — all without a single decryption.
            </p>
            <div className="font-mono inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-[10.5px] tracking-[0.04em] text-[var(--color-ink-2)]">
              <span className="block h-1.5 w-1.5 rounded-full bg-[var(--color-ink)]" />
              Etherscan-verified
            </div>
          </div>

          <div className="lg:col-span-7">
            <motion.div
              variants={cardEntrance}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="relative mx-auto max-w-[520px]"
            >
              <CertificateCard />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CertificateCard() {
  return (
    <div
      className="relative rounded-[10px] bg-[var(--color-cream-warm)] p-7"
      style={{ boxShadow: 'var(--shadow-doc-asym)' }}
    >
      <motion.div
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-[10px] border border-[var(--color-ink)]"
      />
      <div className="font-mono mb-1 text-[10.5px] tracking-[0.04em] text-[var(--color-ink-3)]">
        AnimaPayroll · ERC-7984
      </div>
      <div className="font-display mb-5 flex items-baseline justify-between gap-3 text-[28px] font-medium leading-none text-[var(--color-ink)]">
        <span>confidential vault</span>
        <span className="font-body text-[15px] font-medium text-[var(--color-ink-2)]">
          {truncate(CONTRACTS_META.animaPayroll.address, 6, 4)}
        </span>
      </div>

      <div className="space-y-1.5 border-y border-[var(--color-border)] py-4">
        <SlotRow label="Total Salaries Paid" value={`${TVS_BREAKDOWN.payroll.label}`} />
        <SlotRow label="Active Employees" value="3" />
        <SlotRow label="Yield Sub-Account" value="Internal FHE accounting" />
        <SlotRow label="Protocol" value="Zama FHEVM · euint64" />
        <SlotRow label="Chain" value="Ethereum Sepolia (11155111)" />
      </div>

      <div className="font-mono mt-4 flex flex-col gap-2 text-[12px]">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[var(--color-ink-3)] tracking-[0.04em]">Deployer</span>
          <span className="text-[var(--color-ink)]">0x1062…1BdA</span>
        </div>
        <a
          href={addressUrl(CONTRACTS.AnimaPayroll)}
          target="_blank"
          rel="noreferrer"
          className="flex items-baseline justify-between gap-3 text-[var(--color-ink-2)] transition hover:text-[var(--color-ink)]"
        >
          <span className="tracking-[0.04em]">Contract</span>
          <span>
            {truncate(CONTRACTS.AnimaPayroll, 8, 6)} <span aria-hidden>↗</span>
          </span>
        </a>
      </div>

      <CornerStamp className="-top-3 left-6" label="Ethereum Sepolia" />
      <CornerStamp className="-bottom-3 right-6 rotate-3" label="FHE" />
    </div>
  )
}

function SlotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="font-mono flex items-baseline justify-between gap-3 text-[12px]">
      <span className="text-[var(--color-ink-2)]">{label}</span>
      <span className="text-[var(--color-ink)]">{value}</span>
    </div>
  )
}

function CornerStamp({ className, label }: { className: string; label: string }) {
  return (
    <div
      className={`pointer-events-none absolute font-mono select-none rounded-full border border-[var(--color-ink-2)] bg-[var(--color-paper)] px-3 py-1 text-[9px] tracking-[0.04em] text-[var(--color-ink-2)] ${className}`}
    >
      {label}
    </div>
  )
}

export function LayerHeader({ idx, title, pill }: { idx: string; title: string; pill: string }) {
  return (
    <div className="mb-12 flex items-center justify-between gap-6 text-[var(--color-ink-2)]">
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-[12px] tracking-[0.04em] text-[var(--color-ink-3)]">
          {idx}
        </span>
        <span className="font-display text-[24px] font-light tracking-tight text-[var(--color-ink)]">
          {title}
        </span>
      </div>
      <span className="font-mono inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-1 text-[10.5px] tracking-[0.04em] text-[var(--color-ink-2)]">
        {pill}
      </span>
    </div>
  )
}
