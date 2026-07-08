'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { DUR, EASE } from '@/lib/motion'

// Unicode star spinner, ported from pragma-v2-stable's ThinkingIndicator but
// re-voiced for anima's sovereign-agent context and restyled to the editorial
// palette (muted ink, no terracotta — failure/status never uses color here).
// Boxless: a quiet muted one-liner, NOT a bordered paper bubble (the redesign
// removed bubbles everywhere; the thinking tell follows suit).
const SPINNER_FRAMES = ['✦', '✧', '✶', '✷', '✸', '✹', '✺', '✻']

const ANIMA_VIBES = [
  'Reasoning',
  'Consulting memory',
  'Reaching for tools',
  'Reading the chain',
  'Weighing the options',
  'Composing a reply',
  'Checking permissions',
  'Recalling context',
  'Thinking it through',
  'Working on-chain',
]

interface ThinkingIndicatorProps {
  /** Override the rotating phrase (e.g. a tool name currently running). */
  label?: string
}

export function ThinkingIndicator({ label }: ThinkingIndicatorProps) {
  // The global prefers-reduced-motion CSS block can't reach these JS timers, so
  // gate them here: a reduced-motion user gets a static glyph + static phrase.
  const reduce = useReducedMotion()
  const [frameIndex, setFrameIndex] = useState(0)
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => setFrameIndex(p => (p + 1) % SPINNER_FRAMES.length), 110)
    return () => clearInterval(id)
  }, [reduce])

  useEffect(() => {
    if (reduce || label) return
    const id = setInterval(() => setPhraseIndex(p => (p + 1) % ANIMA_VIBES.length), 1600)
    return () => clearInterval(id)
  }, [reduce, label])

  const message = label ?? ANIMA_VIBES[phraseIndex]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: DUR.base, ease: EASE }}
      className="flex items-center gap-2 text-[var(--color-ink-3)]"
    >
      <span className="font-mono text-[13px] leading-none" aria-hidden>
        {SPINNER_FRAMES[frameIndex]}
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={label ?? phraseIndex}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 4 }}
          transition={{ duration: DUR.base, ease: EASE }}
          className={`font-mono text-[12px] tracking-[0.03em] ${reduce ? '' : 'anima-thinking-shimmer'}`}
        >
          {message}…
        </motion.span>
      </AnimatePresence>
    </motion.div>
  )
}
