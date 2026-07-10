import React from 'react'
import { vi } from 'vitest'

/**
 * Mock next/link so component tests don't require Next.js RouterContext.
 *
 * Renders as a plain <a> tag with the passed href, className, and onClick,
 * so tests can assert on link targets and click handlers.
 */
vi.mock('next/link', () => ({
  default: React.forwardRef<HTMLAnchorElement, any>(
    ({ children, href, className, onClick, ...props }, ref) => {
      return React.createElement(
        'a',
        { ref, href, className, onClick, ...props },
        children,
      )
    },
  ),
}))

// Mock next/navigation so components using useRouter don't crash
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}))
