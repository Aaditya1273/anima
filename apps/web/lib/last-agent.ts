'use client'

// Remembers which agent the operator last opened in chat, so the global
// /console/chat entry can drop them back into that conversation instead of
// forcing a pick. Persisted per browser (localStorage); validated against the
// owned list by the resolver, and the per-agent ownerOf gate still runs after
// the redirect, so a stale value is never a security issue.

const KEY = 'anima:lastChatAgent'

export function rememberLastAgent(tokenId: bigint): void {
  try {
    window.localStorage.setItem(KEY, tokenId.toString())
  } catch {
    /* private mode / storage disabled — last-agent is a convenience, not load-bearing */
  }
}

export function readLastAgent(): bigint | null {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    return BigInt(raw)
  } catch {
    return null
  }
}
