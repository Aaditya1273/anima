'use client'

import {
  type MotionValue,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type Chapter = {
  numeral: string
  headline: string
  body: string
}

const CHAPTERS: Chapter[] = [
  {
    numeral: 'I',
    headline: 'Shielded on chain.',
    body: 'Balances are encrypted at the protocol level, not just in transit. Every salary, every distribution allocation lives as an euint64 handle on Ethereum Sepolia. The blockchain sees the transaction. It never sees the value.',
  },
  {
    numeral: 'II',
    headline: 'Privacy, programmable.',
    body: 'FHE allows selective disclosure. grantObserver gives auditors, regulators, or CFOs an FHE.allow on specific balances without backdoors, without master keys, without revealing anything beyond what was explicitly granted.',
  },
  {
    numeral: 'III',
    headline: 'Earn while encrypted.',
    body: 'Shielded salary deposits into Morpho Steakhouse Confidential Prime USDC vault. The amount stays encrypted through the entire deposit, yield accrual, and withdrawal. Composability without compromise.',
  },
  {
    numeral: 'IV',
    headline: 'Wrapped, not walled.',
    body: 'Every official ERC-20 on Zama registry has an ERC-7984 confidential twin. Wrap and unwrap in one click. The official wrappers are the canonical source — Anima indexes them, does not duplicate them.',
  },
  {
    numeral: 'V',
    headline: 'Distribute, confidentially.',
    body: 'TokenOps SDK encrypts each recipient allocation before it reaches the chain. The full recipient list is never revealed on-chain. Recipients decrypt only their own amount via EIP-712. No MEV, no front-running, no exposure.',
  },
  {
    numeral: 'VI',
    headline: 'Visible on your terms.',
    body: 'Total Value Shielded tracks across all surfaces. Payroll vault, wrapped balances, pending distributions — the TVS dashboard shows the aggregate. What you reveal is what you choose. The rest stays encrypted.',
  },
]

const PANEL_COUNT = CHAPTERS.length + 2

function ZamaMark() {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <Image
        src="/0g/zama-black.png"
        alt="Zama"
        width={80}
        height={20}
        className="block h-[0.72em] w-auto dark:hidden"
        priority={false}
      />
      <Image
        src="/0g/zama-white.png"
        alt="Zama"
        width={80}
        height={20}
        className="hidden h-[0.72em] w-auto dark:block"
        priority={false}
      />
    </span>
  )
}

export function V1Opener() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const progress = useMotionValue(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) {
      progress.set(0)
      return
    }
    let raf = 0
    const tick = () => {
      const el = sectionRef.current
      if (!el) {
        raf = window.requestAnimationFrame(tick)
        return
      }
      const rect = el.getBoundingClientRect()
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) {
        raf = window.requestAnimationFrame(tick)
        return
      }
      const total = el.offsetHeight - window.innerHeight
      if (total <= 0) {
        progress.set(0)
      } else {
        const raw = -rect.top / total
        progress.set(raw < 0 ? 0 : raw > 1 ? 1 : raw)
      }
      raf = window.requestAnimationFrame(tick)
    }
    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
  }, [reduceMotion, progress])

  const washOp = useTransform(progress, [0, 0.06, 0.86, 1], [0, 0.75, 0.75, 0.42])
  const washY = useTransform(progress, [0, 1], [80, 0])
  const washScale = useTransform(progress, [0, 1], [1.06, 1])

  if (reduceMotion) return <StackedFallback />

  return (
    <section
      ref={sectionRef}
      className="relative bg-[var(--color-cream)]"
      style={{ height: `${PANEL_COUNT * 100}vh` }}
    >
      <div
        id="section-layers"
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 h-px"
        style={{ top: '7%' }}
      />
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div
          aria-hidden
          style={{
            opacity: washOp,
            y: washY,
            scale: washScale,
            maskImage:
              'radial-gradient(ellipse 90% 80% at 88% 112%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.78) 38%, rgba(0,0,0,0) 88%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 90% 80% at 88% 112%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.78) 38%, rgba(0,0,0,0) 88%)',
          }}
          className="pointer-events-none absolute inset-x-0 -bottom-24 h-[calc(92vh+6rem)] origin-bottom-right"
        >
          <Image
            src="/aurelia/grove.png"
            alt=""
            fill
            priority={false}
            sizes="100vw"
            className="object-cover object-[right_bottom]"
            style={{
              filter: 'blur(4px) saturate(1) contrast(0.98)',
            }}
          />
        </motion.div>

        <div className="relative z-10 mx-auto w-full max-w-[var(--container-wrap)] px-6 sm:px-10">
          <div className="relative h-[72vh] w-full md:w-[58%] lg:w-[52%]">
            <TrioPanel index={0} total={PANEL_COUNT} progress={progress} />
            {CHAPTERS.map((ch, i) => (
              <ChapterPanel
                key={ch.numeral}
                ch={ch}
                index={i + 1}
                total={PANEL_COUNT}
                progress={progress}
              />
            ))}
            <RunPanel index={CHAPTERS.length + 1} total={PANEL_COUNT} progress={progress} />
          </div>
        </div>
      </div>
      <div
        id="run"
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 h-px"
        style={{ top: '87.5%' }}
      />
    </section>
  )
}

function usePanelStyle(progress: MotionValue<number>, index: number, total: number) {
  const start = index / total
  const end = (index + 1) / total
  const fade = 0.04
  const opacity = useTransform(progress, [start - fade, start, end - fade, end], [0, 1, 1, 0])
  const y = useTransform(progress, [start - fade, end], [22, -22])
  return { opacity, y }
}

function useFinalPanelStyle(progress: MotionValue<number>, index: number, total: number) {
  const start = index / total
  const fade = 0.05
  const opacity = useTransform(progress, [start - fade, start + fade * 0.4, 1.05], [0, 1, 1])
  const y = useTransform(progress, [start - fade, 1], [22, 0])
  return { opacity, y }
}

function useStageReveal(
  progress: MotionValue<number>,
  range: [number, number],
  { y: yDist = 18, blur = 8 }: { y?: number; blur?: number } = {},
) {
  const opacity = useTransform(progress, range, [0, 1])
  const y = useTransform(progress, range, [yDist, 0])
  const blurPx = useTransform(progress, range, [blur, 0])
  const filter = useMotionTemplate`blur(${blurPx}px)`
  return { opacity, y, filter }
}

function TrioPanel({
  index,
  total,
  progress,
}: {
  index: number
  total: number
  progress: MotionValue<number>
}) {
  const { opacity: panelOpacity, y: panelY } = usePanelStyle(progress, index, total)

  const trioStage = { y: 32, blur: 12 }
  const l1 = useStageReveal(progress, [0.005, 0.025], trioStage)
  const l2 = useStageReveal(progress, [0.025, 0.045], trioStage)
  const l3 = useStageReveal(progress, [0.045, 0.065], trioStage)
  const ogOp = useTransform(progress, [0.05, 0.075], [0, 1])
  const ogScale = useTransform(progress, [0.05, 0.075], [0.84, 1])

  return (
    <motion.div
      style={{ opacity: panelOpacity, y: panelY }}
      className="font-display absolute inset-0 flex flex-col justify-center gap-1 font-light text-[var(--color-ink)]"
    >
      <div
        style={{
          fontVariationSettings: '"opsz" 96, "SOFT" 30, "WONK" 0',
          fontSize: 'clamp(44px, 5vw, 76px)',
          lineHeight: 1.02,
          letterSpacing: '-0.025em',
        }}
      >
        <motion.div style={l1}>No backdoors.</motion.div>
        <motion.div style={l2}>No plaintext.</motion.div>
        <motion.div style={l3} className="flex flex-wrap items-baseline gap-x-3">
          <span>Powered by</span>
          <motion.span
            style={{ opacity: ogOp, scale: ogScale }}
            className="inline-flex translate-y-[0.04em] items-baseline"
          >
            <ZamaMark />
          </motion.span>
          <span aria-hidden>.</span>
        </motion.div>
      </div>
    </motion.div>
  )
}


function ChapterPanel({
  ch,
  index,
  total,
  progress,
}: {
  ch: Chapter
  index: number
  total: number
  progress: MotionValue<number>
}) {
  const { opacity, y } = usePanelStyle(progress, index, total)

  const panelStart = index / total
  const numeralStage = useStageReveal(progress, [panelStart + 0.005, panelStart + 0.025])
  const headlineStage = useStageReveal(progress, [panelStart + 0.022, panelStart + 0.048])
  const bodyStage = useStageReveal(progress, [panelStart + 0.042, panelStart + 0.075])

  return (
    <motion.article
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col justify-center"
    >
      <motion.div style={numeralStage} className="font-display font-light">
        <span
          style={{
            fontVariationSettings: '"opsz" 144, "SOFT" 0, "WONK" 0',
            fontSize: 'clamp(34px, 3.4vw, 52px)',
            lineHeight: 1,
            color: 'var(--color-ink-3)',
          }}
        >
          {ch.numeral}
        </span>
      </motion.div>
      <motion.h3 style={headlineStage} className="font-display mt-8 font-light">
        <span
          style={{
            fontVariationSettings: '"opsz" 96, "SOFT" 30, "WONK" 0',
            fontSize: 'clamp(36px, 4.2vw, 60px)',
            lineHeight: 1.04,
            letterSpacing: '-0.02em',
            color: 'var(--color-ink)',
          }}
        >
          {ch.headline}
        </span>
      </motion.h3>
      <motion.p style={bodyStage} className="font-body mt-7 max-w-[44ch]">
        <span style={{ fontSize: 17, lineHeight: 1.75, color: 'var(--color-ink-2)' }}>
          {ch.body}
        </span>
      </motion.p>
    </motion.article>
  )
}
function RunPanel({
  index,
  total,
  progress,
}: {
  index: number
  total: number
  progress: MotionValue<number>
}) {
  const { opacity, y } = useFinalPanelStyle(progress, index, total)

  const panelStart = index / total
  const headlineStage = useStageReveal(progress, [panelStart + 0.005, panelStart + 0.03])
  const bodyStage = useStageReveal(progress, [panelStart + 0.025, panelStart + 0.055])
  const ctaStage = useStageReveal(progress, [panelStart + 0.045, panelStart + 0.075])

  const pointerEvents = useTransform(opacity, v => (v > 0.5 ? 'auto' : 'none'))

  return (
    <motion.article
      style={{ opacity, y, pointerEvents }}
      className="absolute inset-y-0 left-0 right-0 flex items-center md:right-auto md:w-[172.5%] lg:w-[192.3%]"
    >
      <div className="flex w-full flex-col items-center text-center">
        <motion.h3 style={headlineStage} className="font-display font-light">
          <span
            style={{
              fontVariationSettings: '"opsz" 144, "SOFT" 30, "WONK" 0',
              fontSize: 'clamp(80px, 9vw, 152px)',
              lineHeight: 0.94,
              letterSpacing: '-0.03em',
              color: 'var(--color-ink)',
            }}
          >
            Shield.
          </span>
        </motion.h3>
        <motion.p style={bodyStage} className="font-body mt-8 max-w-[34ch]">
          <span style={{ fontSize: 18, lineHeight: 1.7, color: 'var(--color-ink-2)' }}>
            Shield once. Earn while encrypted.
          </span>
        </motion.p>
        <motion.div style={ctaStage} className="mt-7 flex flex-col items-center gap-4">
          <CommandPill command="pnpm add @lusio/anima" />
          <DocsLink />
        </motion.div>
      </div>
    </motion.article>
  )
}

function DocsLink() {
  return (
    <Link
      href="/docs"
      className="font-body group inline-flex items-center gap-1.5 text-[var(--color-ink-3)] transition-colors hover:text-[var(--color-ink-2)]"
      style={{ fontSize: 13, letterSpacing: '-0.005em' }}
    >
      <span>Read the full docs</span>
      <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  )
}

function CommandPill({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  function handleCopy() {
    navigator.clipboard
      .writeText(command)
      .then(() => {
        setCopied(true)
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => setCopied(false), 1500)
      })
      .catch(() => {})
  }

  return (
    <div
      className="inline-flex items-baseline gap-2.5 font-mono"
      style={{ fontSize: 14, letterSpacing: '-0.005em' }}
    >
      <span aria-hidden style={{ color: 'var(--color-ink-3)' }}>
        $
      </span>
      <span style={{ color: 'var(--color-ink-2)' }}>{command}</span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Copied' : 'Copy install command'}
        className="ml-0.5 flex h-6 w-6 shrink-0 translate-y-1 items-center justify-center rounded-full text-[var(--color-ink-3)] transition-colors hover:bg-[color-mix(in_oklab,var(--color-ink)_4%,transparent)] hover:text-[var(--color-ink-2)]"
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  )
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-[13px] w-[13px]"
    >
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.6" />
      <path d="M10.5 5.5V4A1.5 1.5 0 0 0 9 2.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-[13px] w-[13px]"
    >
      <path d="M3 8.5l3 3 7-7" />
    </svg>
  )
}

function StackedFallback() {
  return (
    <section id="section-layers" className="relative bg-[var(--color-cream)] py-24 sm:py-32">
      <div className="mx-auto max-w-[var(--container-wrap)] space-y-24 px-6 sm:px-10">
        <div
          className="font-display flex flex-col gap-1 font-light text-[var(--color-ink)]"
          style={{
            fontVariationSettings: '"opsz" 96, "SOFT" 30, "WONK" 0',
            fontSize: 'clamp(40px, 4.4vw, 64px)',
            lineHeight: 1.04,
            letterSpacing: '-0.02em',
          }}
        >
          <div>No backdoors.</div>
          <div>No plaintext.</div>
          <div className="flex flex-wrap items-baseline gap-x-3">
            <span>Powered by</span>
            <span className="inline-flex translate-y-[0.04em] items-baseline">
              <ZamaMark />
            </span>
            <span aria-hidden>.</span>
          </div>
        </div>
        {CHAPTERS.map(ch => (
          <article key={ch.numeral}>
            <div
              className="font-display font-light"
              style={{
                fontVariationSettings: '"opsz" 144, "SOFT" 0, "WONK" 0',
                fontSize: 'clamp(34px, 3.4vw, 52px)',
                lineHeight: 1,
                color: 'var(--color-ink-3)',
              }}
            >
              {ch.numeral}
            </div>
            <h3
              className="font-display mt-6 font-light"
              style={{
                fontVariationSettings: '"opsz" 96, "SOFT" 30, "WONK" 0',
                fontSize: 'clamp(36px, 4.2vw, 60px)',
                lineHeight: 1.04,
                letterSpacing: '-0.02em',
                color: 'var(--color-ink)',
              }}
            >
              {ch.headline}
            </h3>
            <p
              className="font-body mt-6 max-w-[44ch]"
              style={{ fontSize: 17, lineHeight: 1.75, color: 'var(--color-ink-2)' }}
            >
              {ch.body}
            </p>
          </article>
        ))}
        <article
          id="run"
          className="flex flex-col items-center text-center"
          style={{ scrollMarginTop: '24px' }}
        >
          <h3
            className="font-display font-light"
            style={{
              fontVariationSettings: '"opsz" 144, "SOFT" 30, "WONK" 0',
              fontSize: 'clamp(72px, 9vw, 144px)',
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
              color: 'var(--color-ink)',
            }}
          >
            Shield.
          </h3>
          <p
            className="font-body mt-6 max-w-[36ch]"
            style={{ fontSize: 18, lineHeight: 1.7, color: 'var(--color-ink-2)' }}
          >
            Shield once. Earn while encrypted.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <CommandPill command="pnpm add @lusio/anima" />
            <DocsLink />
          </div>
        </article>
      </div>
    </section>
  )
}
