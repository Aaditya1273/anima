import type { Address, Hex } from 'viem'

export function shortAddress(a: Address | string, head = 6, tail = 4): string {
  if (!a) return ''
  if (a.length <= head + tail + 2) return a
  return `${a.slice(0, head)}…${a.slice(-tail)}`
}

export function shortHash(h: Hex | string, head = 8, tail = 6): string {
  if (!h) return ''
  if (h.length <= head + tail + 2) return h
  return `${h.slice(0, head)}…${h.slice(-tail)}`
}

export function formatBigInt(n: bigint): string {
  return new Intl.NumberFormat('en-US').format(n)
}

export function formatRelativeTime(secondsAgo: number): string {
  if (secondsAgo < 0) return 'just now'
  if (secondsAgo < 60) return `${secondsAgo}s ago`
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`
  return `${Math.floor(secondsAgo / 86400)}d ago`
}

