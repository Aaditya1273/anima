'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect } from 'react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

declare global {
  interface Window {
    __lenis?: Lenis
  }
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // The console is a fixed, full-screen app surface with its OWN nested scroll
    // containers (chat transcript, sessions list, agent dropdown, memory browser).
    // Lenis hijacks wheel/touch globally to smooth-scroll the page — but the
    // console page itself doesn't scroll (it's `fixed inset-0 overflow-hidden`),
    // so Lenis just swallows the wheel and the nested scrollers never move.
    // Smooth-scroll belongs to the marketing pages only; the app uses native
    // scroll (with the scrollbar hidden via `.no-scrollbar`).
    if (pathname?.startsWith('/console')) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    })

    window.__lenis = lenis

    // Single rAF source: GSAP's ticker drives Lenis, Lenis fires scroll events
    // that ScrollTrigger picks up. Avoid a separate requestAnimationFrame loop;
    // double-ticking Lenis advances its internal scroll twice per frame and
    // produces juddery values for everything subscribing via window.scrollY.
    const lenisTick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(lenisTick)
    gsap.ticker.lagSmoothing(0)
    lenis.on('scroll', ScrollTrigger.update)

    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)

    return () => {
      gsap.ticker.remove(lenisTick)
      lenis.destroy()
      window.removeEventListener('resize', onResize)
      ScrollTrigger.killAll()
      window.__lenis = undefined
    }
  }, [pathname])

  return <>{children}</>
}
