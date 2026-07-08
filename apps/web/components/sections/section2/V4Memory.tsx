'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { TVS_BREAKDOWN } from '@/lib/snapshot'
import { LayerHeader } from './V2Identity'

const TVS_LINES = [
  'TVS: 66,400 USDC',
  'vault: 12,500 USDC · 3 employees',
  'disperse: 45,000 USDC · 24 recipients',
  '',
  '## Breakdown',
  'Payroll vault balances are euint64 handles.',
  'Distribution allocations are encrypted per-recipient.',
  'Wrapped ERC-7984 balances tracked by totalSupply.',
  'TVS computed from on-chain encrypted supply.',
]

const HEX_GLYPHS = '0123456789abcdef·'

export function V4Memory() {
  return (
    <section
      id="layer-memory"
      className="relative flex min-h-screen items-center py-[var(--section-py)]"
    >
      <div className="mx-auto w-full max-w-[var(--container-wrap)] px-6 sm:px-8">
        <LayerHeader idx="03" title="TVS" pill="Ethereum Sepolia · FHE encrypted supply" />
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[clamp(36px,5vw,68px)] font-light leading-[1.04] tracking-[-0.018em] text-[var(--color-ink)]"
            >
              Value <span className="font-italic-serif italic">shielded</span>, not hidden.
            </motion.h2>
            <p className="max-w-md text-[15px] leading-relaxed text-[var(--color-ink-2)]">
              Total Value Shielded tracks every encrypted dollar across all Anima surfaces.
              Payroll vault balances, pending distribution allocations, and wrapped ERC-7984
              positions — all counted via on-chain totalEncryptedSupply. No decryption needed.
              The aggregate is public. The details stay private.
            </p>
          </div>
          <div className="lg:col-span-7">
            <FileCard />
          </div>
        </div>
      </div>
    </section>
  )
}

function FileCard() {
  const [scrambled, setScrambled] = useState(false)

  useEffect(() => {
    let resetTimer: ReturnType<typeof setTimeout> | null = null
    const id = setInterval(() => {
      setScrambled(true)
      resetTimer = setTimeout(() => setScrambled(false), 700)
    }, 8200)
    return () => {
      clearInterval(id)
      if (resetTimer) clearTimeout(resetTimer)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto max-w-[560px]"
    >
      <div
        className="relative rounded-[10px] bg-[var(--color-paper)] p-6"
        style={{ boxShadow: 'var(--shadow-doc-asym)' }}
      >
        <div className="font-mono mb-3 flex items-center justify-between text-[10.5px] tracking-[0.04em] text-[var(--color-ink-3)]">
          <span>/tvs/dashboard</span>
          <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-cream-warm)] px-2 py-0.5 text-[9px] tracking-[0.04em] text-[var(--color-ink-2)]">
            Aggregate only
          </span>
        </div>

        <pre className="font-mono mb-4 whitespace-pre-wrap break-words text-[12px] leading-[1.65] text-[var(--color-ink)]">
          {TVS_LINES.map((line, i) => (
            <ScrambleLine key={i} line={line} scrambled={scrambled} />
          ))}
        </pre>

        <div className="space-y-1.5 border-t border-[var(--color-border)] pt-3 text-[11.5px]">
          <Row label="Total TVS" value="66,400 USDC" />
          <Row label="Payroll Vault" value="12,500 USDC" />
          <Row label="Distributions" value="45,000 USDC" />
          <Row label="Wrapped Balances" value="8,900 USDC" />
        </div>
      </div>

      <p className="mt-5 text-center text-[13px] text-[var(--color-ink-2)]">
        aggregate public. details encrypted.{' '}
        <a
          href="https://sepolia.etherscan.io"
          target="_blank"
          rel="noreferrer"
          className="text-[var(--color-ink)] underline-offset-2 hover:underline"
        >
          verify on Etherscan ↗
        </a>
      </p>
    </motion.div>
  )
}

function ScrambleLine({ line, scrambled }: { line: string; scrambled: boolean }) {
  if (!scrambled || line === '') {
    return <span className="block">{line || '\u00A0'}</span>
  }
  return (
    <span className="block">
      {line.split('').map((char, i) =>
        char === ' ' ? (
          <span key={i}> </span>
        ) : (
          <motion.span
            key={i}
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            className="inline-block text-[var(--color-ink-2)]"
          >
            {HEX_GLYPHS[Math.floor(Math.random() * HEX_GLYPHS.length)]}
          </motion.span>
        ),
      )}
    </span>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="font-mono flex items-baseline justify-between gap-3 text-[11.5px]">
      <span className="text-[var(--color-ink-3)] tracking-[0.04em]">{label}</span>
      <span className="text-right text-[var(--color-ink)]">{value}</span>
    </div>
  )
}
