'use client'

// Local paced reveal for assistant replies. anima's relay-client.chat() returns
// the whole response string in one shot (no wire-level token streaming), so a
// blunt render pops the reply in as a wall of text. This hook re-paces that
// final string into readable bursts — ported from pragma-v2-stable's
// useStreamingMessage cadence, adapted for a complete-string input rather than a
// delta feed. Restarts when the source string changes (a new turn) and cancels
// its rAF on unmount. Honors prefers-reduced-motion (renders instantly). Each
// assistant reply mounts a fresh, stable-keyed instance, so a turn never
// unmounts mid-reveal in practice.

import { useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

// Reveal a fresh burst at most every 80ms; never let a burst lag more than
// 300ms behind (safety flush). Matches pragma's perceived "considered" pace.
const IMMEDIATE_THRESHOLD_MS = 80
const AUTO_FLUSH_INTERVAL_MS = 600
// Characters revealed per burst — paces a long reply without feeling typed-out.
// Smaller bursts + a longer flush window keep the cadence even (closer to
// Claude's token pace) instead of stair-stepping or dumping the tail on a slow
// markdown re-parse.
const CHARS_PER_BURST = 8

export interface RevealState {
  /** The portion of `full` currently visible. */
  shown: string
  /** True while still revealing (drives MarkdownRenderer isAnimating). */
  done: boolean
}

export function useRevealedText(full: string, enabled = true): RevealState {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(() => (enabled && !reduce ? '' : full))
  const idxRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const lastTickRef = useRef(0)

  useEffect(() => {
    if (!enabled || reduce) {
      setShown(full)
      idxRef.current = full.length
      return
    }
    // New/replaced source (e.g. a different turn) — restart the reveal.
    if (idxRef.current > full.length) {
      idxRef.current = 0
      lastTickRef.current = 0
      setShown('')
    }

    const step = (now: number) => {
      // Seed the clock on the first frame. Without this, `lastTickRef` starts at
      // 0 and `since = now - 0` (≈ time since page load) is always >= the flush
      // interval, so the whole reply would dump in one frame and the paced
      // reveal would never actually run.
      if (lastTickRef.current === 0) lastTickRef.current = now
      if (idxRef.current >= full.length) {
        rafRef.current = null
        return
      }
      const since = now - lastTickRef.current
      if (since >= IMMEDIATE_THRESHOLD_MS) {
        lastTickRef.current = now
        // Bursts grow slightly with elapsed lag so we never fall >300ms behind.
        const burst =
          since >= AUTO_FLUSH_INTERVAL_MS ? full.length - idxRef.current : CHARS_PER_BURST
        idxRef.current = Math.min(full.length, idxRef.current + burst)
        setShown(full.slice(0, idxRef.current))
      }
      rafRef.current = requestAnimationFrame(step)
    }

    if (rafRef.current == null && idxRef.current < full.length) {
      rafRef.current = requestAnimationFrame(step)
    }

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [full, enabled, reduce])

  const done = shown.length >= full.length
  return { shown, done }
}
