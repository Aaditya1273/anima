import React from 'react'
import { vi } from 'vitest'

/**
 * Mock framer-motion for component tests.
 *
 * - `motion.div` / `motion.nav` / `motion.span` render as plain HTML elements
 *   (forwardRef) and pass through `style`, `className`, and all aria/data
 *   attributes. Framer-specific props (initial, animate, layout, etc.) are
 *   filtered out so they don't end up as DOM attributes.
 * - `AnimatePresence` renders children directly (no exit animation).
 * - `useMotionValue` returns a simple object with `.get()`, `.set()`.
 * - `useSpring` / `useTransform` pass through the value unchanged.
 * - `useMotionTemplate` returns an empty string.
 */
function createMotionElement(tag: string) {
  const Component = React.forwardRef<HTMLElement, any>(
    ({ children, ...props }, ref) => {
      // Filter out framer-motion-specific props that should never reach DOM
      const {
        initial,
        animate,
        exit,
        transition,
        variants,
        layout,
        layoutId,
        layoutDependency,
        whileHover,
        whileTap,
        whileFocus,
        whileInView,
        viewport,
        onAnimationStart,
        onAnimationComplete,
        onDrag,
        onDragStart,
        onDragEnd,
        drag,
        dragConstraints,
        dragElastic,
        ...passthrough
      } = props
      return React.createElement(tag, { ref, ...passthrough }, children)
    },
  )
  Component.displayName = `motion.${tag}`
  return Component
}

const motionEls = ['div', 'span', 'nav', 'a', 'button', 'p', 'section', 'li', 'ul', 'ol'] as const

const motion = Object.fromEntries(
  motionEls.map(tag => [tag, createMotionElement(tag)]),
) as Record<(typeof motionEls)[number], React.ForwardRefExoticComponent<any>>

vi.mock('framer-motion', () => ({
  motion,
  AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  useMotionValue: (initial: number) => ({
    get: () => initial,
    set: vi.fn(),
    onChange: vi.fn(),
  }),
  useSpring: (value: any) => value,
  useTransform: () => ({ get: () => 0 }),
  useMotionTemplate: () => '',
  useReducedMotion: () => false,
}))
