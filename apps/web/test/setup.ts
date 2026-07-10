import '@testing-library/jest-dom/vitest'

// Wire up mocks so wagmi/viem hooks don't make real RPC calls
import './mocks/wagmi'
import './mocks/viem'

// Wire up mocks for UI framework dependencies used by many components
import './mocks/framer-motion'
import './mocks/next'

// vitest v4 jsdom environment may not provide a fully functional localStorage
// on the window object. ThemeProvider, wallet hooks, and other components
// depend on it — provide a simple in-memory implementation.
const __store: Record<string, string> = {}
Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: {
    getItem: (key: string) => __store[key] ?? null,
    setItem: (key: string, val: string) => { __store[key] = String(val) },
    removeItem: (key: string) => { delete __store[key] },
    clear: () => { Object.keys(__store).forEach(k => delete __store[k]) },
    get length() { return Object.keys(__store).length },
    key: (i: number) => Object.keys(__store)[i] ?? null,
  },
})

// jsdom does not implement matchMedia — ThemeProvider, Hero, and other
// components that check prefers-color-scheme need it. Provide a stub that
// returns a consistent light-mode default and no-op listener methods.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false, // default to light mode
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})
