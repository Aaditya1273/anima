'use client'

// Owned-agent enumeration for the console rail. Same chain reads as AgentList
// (getAgentsByOwner + chain meta + subname labels), reshaped into the rail's
// display fields. Presence is a freshness proxy: an agent that synced within
// 24h reads as "live" (there is no real liveness flag on chain).

import { useSiwe } from '@/components/SiweContext'
import { zgMainnet } from '@/lib/chain/chain'
import {
  type AgentChainMeta,
  type AgentSummary,
  getAgentChainMetaByTokenId,
  getAgentsByOwner,
} from '@/lib/chain/inft'
import { getLabelByAgentEoa } from '@/lib/chain/sann'
import { formatRelativeTime } from '@/lib/format'
import { useEffect, useMemo, useState } from 'react'
import type { Address } from 'viem'
import { usePublicClient } from 'wagmi'

export type ConsoleAgent = {
  tokenId: bigint
  /** subname label without the suffix, e.g. 'specter' (null if unnamed). */
  subname: string | null
  /** Display name: 'specter.anima.0g' or 'Agent #16'. */
  displayName: string
  agentEoa: Address | null
  /** synced within 24h (presence proxy). */
  live: boolean
  /** relative last-sync, e.g. '2m ago' (null if never synced). */
  lastActive: string | null
  /** lifetime, e.g. '47d' / 'today' (null if never synced). */
  alive: string | null
}

type LoadState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ready'; agents: ConsoleAgent[] }
  | { kind: 'error'; message: string }

const POLL_INTERVAL_MS = 30_000
const TICK_INTERVAL_MS = 15_000

function aliveValue(meta: AgentChainMeta): string {
  const now = Math.floor(Date.now() / 1000)
  const days = Math.max(1, now - meta.firstSyncAt) / 86400
  return days < 1 ? 'today' : days < 1.5 ? '1d' : `${Math.round(days)}d`
}

function reshape(
  agents: AgentSummary[],
  labels: Map<bigint, string>,
  meta: Map<bigint, AgentChainMeta>,
): ConsoleAgent[] {
  const nowSec = Math.floor(Date.now() / 1000)
  const out = agents.map<ConsoleAgent>(a => {
    const m = meta.get(a.tokenId)
    const label = labels.get(a.tokenId) ?? null
    const lastSyncAgo = m ? nowSec - m.lastSyncAt : null
    return {
      tokenId: a.tokenId,
      subname: label,
      displayName: label ? `${label}.anima.0g` : `Agent #${a.tokenId.toString()}`,
      agentEoa: m?.agentEoa ?? null,
      live: lastSyncAgo !== null && lastSyncAgo < 86_400,
      lastActive: lastSyncAgo !== null ? formatRelativeTime(lastSyncAgo) : null,
      alive: m ? aliveValue(m) : null,
    }
  })
  // Dormant (never synced) sink to the bottom; mint-order within each group.
  return out.sort((a, b) => {
    const aD = !meta.has(a.tokenId)
    const bD = !meta.has(b.tokenId)
    if (aD !== bD) return aD ? 1 : -1
    return a.tokenId < b.tokenId ? -1 : a.tokenId > b.tokenId ? 1 : 0
  })
}

export function useOwnedAgents(): {
  agents: ConsoleAgent[]
  loading: boolean
  /** True only once the owned scan has SETTLED (state 'ready'). Distinguishes
   * "not loaded yet" (idle/loading) from "loaded, genuinely zero agents" —
   * callers that redirect on emptiness must wait for this, not `!loading`
   * (the initial 'idle' state has loading=false with an empty list). */
  ready: boolean
  error: string | null
} {
  const siwe = useSiwe()
  const address = siwe.address
  const client = usePublicClient({ chainId: zgMainnet.id })
  const [state, setState] = useState<LoadState>({ kind: 'idle' })
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!address || !client) {
      setState({ kind: 'idle' })
      return
    }
    let alive = true
    let isInitial = true
    setState({ kind: 'loading' })

    async function load() {
      try {
        const agents = await getAgentsByOwner(client!, address as Address)
        if (!alive) return
        const tokenIds = agents.map(a => a.tokenId)
        const [meta, labelByEoa] = await Promise.all([
          getAgentChainMetaByTokenId(client!, tokenIds).catch(
            () => new Map<bigint, AgentChainMeta>(),
          ),
          getLabelByAgentEoa(client!).catch(() => new Map<string, string>()),
        ])
        if (!alive) return
        const labels = new Map<bigint, string>()
        for (const [tid, m] of meta) {
          const label = labelByEoa.get(m.agentEoa.toLowerCase())
          if (label) labels.set(tid, label)
        }
        setState({ kind: 'ready', agents: reshape(agents, labels, meta) })
      } catch (err) {
        if (!alive) return
        if (isInitial) setState({ kind: 'error', message: (err as Error).message })
      } finally {
        isInitial = false
      }
    }

    void load()
    const poll = setInterval(() => alive && void load(), POLL_INTERVAL_MS)
    return () => {
      alive = false
      clearInterval(poll)
    }
  }, [address, client])

  // Keep relative-time strings fresh between refetches.
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), TICK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  return useMemo(
    () => ({
      agents: state.kind === 'ready' ? state.agents : [],
      loading: state.kind === 'loading',
      ready: state.kind === 'ready',
      error: state.kind === 'error' ? state.message : null,
    }),
    [state],
  )
}
