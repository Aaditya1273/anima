'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { CYCLES } from '@/lib/cycles'
import { TuiCanvas } from './hero/TuiCanvas'
import { TgCanvas } from './hero/TgCanvas'
import { OutputCanvas } from './hero/OutputCanvas'

export function HeroCanvas() {
  const [activeIdx, setActiveIdx] = useState(0)
  const cycle = CYCLES[activeIdx]!

  useEffect(() => {
    const id = setTimeout(() => {
      setActiveIdx(i => (i + 1) % CYCLES.length)
    }, cycle.durationMs)
    return () => clearTimeout(id)
  }, [activeIdx, cycle.durationMs])

  return (
    <div className="relative">
      {/*
       * OUTER FRAME — fixed 740px height to give it vertical room, never grows.
       * position: relative is the anchor for the absolutely-positioned inner frame.
       * overflow-hidden clips everything at the painted edge.
       */}
      <div
        className="relative overflow-hidden rounded-[24px] border border-[var(--color-border)] shadow-[0_40px_80px_-50px_rgba(40,28,18,0.5)]"
        style={{ height: 740 }}
      >
        {/* Background paintings — fill the frame, z-index 0 */}
        {CYCLES.map((c, i) => (
          <Image
            key={c.id}
            src={`/aurelia/${c.painting}.png`}
            alt=""
            fill
            priority={i === 0}
            loading={i === 0 ? undefined : 'lazy'}
            quality={85}
            sizes="(min-width: 1024px) 1480px, 100vw"
            className="object-cover transition-opacity duration-[1200ms] ease-out"
            style={{ opacity: i === activeIdx ? 0.95 : 0, transform: 'scale(1.04)', zIndex: 0 }}
          />
        ))}

        {/* Vignette — z-index 1 */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background:
              'radial-gradient(110% 80% at 50% 50%, rgba(20,15,8,0) 55%, rgba(20,15,8,0.10) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/*
         * INNER IDE FRAME — absolutely positioned so its dimensions are
         * 100% determined by `inset`, never by children's intrinsic size.
         * top/left/right = 24px (painting margin), bottom = 0 (flush).
         * z-index 2 sits above painting + vignette.
         */}
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            right: 24,
            bottom: 0,
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* White IDE card — rounded top only, flush at bottom */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'row',          // ← the split axis
              overflow: 'hidden',
              borderRadius: '14px 14px 0 0',
              border: '1px solid var(--color-border)',
              borderBottom: 'none',
              background: 'var(--color-paper)',
              boxShadow: '0 -24px 50px -30px rgba(40,28,18,0.32)',
            }}
          >
            {/* LEFT pane — terminal (42% fixed width) */}
            <div
              style={{
                width: '42%',
                flexShrink: 0,
                height: '100%',
                overflow: 'hidden',
                borderRight: '1px solid var(--color-border)',
              }}
            >
              {cycle.surface === 'tui' ? (
                <TuiCanvas key={cycle.id} cycle={cycle} />
              ) : (
                <TgCanvas key={cycle.id} cycle={cycle} />
              )}
            </div>

            {/* RIGHT pane — "behind the chat" (fills rest) */}
            <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
              <OutputCanvas key={`${cycle.id}-out`} cycle={cycle} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
