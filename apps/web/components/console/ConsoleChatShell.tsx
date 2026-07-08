'use client'

// The real chat-first console shell (the vitrine-rail direction, wired to live
// data). Left rail = the operator's owned agents (switch by navigating to that
// agent's chat); main = the active agent's identity + a per-agent SESSION strip
// (switch thread / New Session) + the live ChatPanel. Full-bleed, no hairline
// separators (tone shift + whitespace do the work), per the locked console
// style. The shell owns ONE relay connection + RelayGatewayClient so the
// session strip and chat share it; the chat re-keys per session.

import { useSiwe } from '@/components/SiweContext'
import { useAgentContext } from '@/components/console/agent-context'
import { ChatPanel, type ChatConnState } from '@/components/console/chat/ChatPanel'
import { AuthorizeDevice, DeviceManager } from '@/components/console/DeviceAuth'
import { useDeviceAuth } from '@/components/console/use-device-auth'
import { type ConsoleAgent, useOwnedAgents } from '@/components/console/use-owned-agents'
import { PaperNoise } from '@/components/PaperNoise'
import { type SessionMeta, RelayGatewayClient } from '@/lib/gateway/relay-client'
import { shortAddress } from '@/lib/format'
import { rememberLastAgent } from '@/lib/last-agent'
import { DUR, EASE } from '@/lib/motion'
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Address, Hex } from 'viem'
import { useAccount, useConnect, useSignMessage } from 'wagmi'

const fv = (opsz: number) => ({ fontVariationSettings: `"opsz" ${opsz}, "SOFT" 30, "WONK" 0` })

/** Compact relative time for a session's last activity ('' when unknown). */
function relTime(ts?: number): string {
  if (!ts) return ''
  const ms = Date.now() - ts
  if (ms < 60_000) return 'now'
  const m = Math.round(ms / 60_000)
  if (m < 60) return `${m}m`
  const h = Math.round(ms / 3_600_000)
  if (h < 24) return `${h}h`
  return `${Math.round(ms / 86_400_000)}d`
}

type ConnInfo = { relayUrl: string; agentId: string; readToken?: string; operator?: Address }

function PresenceDot({ live, size = 0.6 }: { live: boolean; size?: number }) {
  return (
    <span
      aria-hidden
      className={live ? 'text-[var(--color-ink-2)]' : 'text-[var(--color-ink-3)]'}
      style={{ fontSize: `${size}em`, lineHeight: 1 }}
    >
      ●
    </span>
  )
}

function AgentRow({
  agent,
  active,
  disabled,
  onSelect,
}: {
  agent: ConsoleAgent
  active: boolean
  disabled?: boolean
  onSelect: (a: ConsoleAgent) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(agent)}
      disabled={disabled && !active}
      className="group flex w-full items-center gap-3 rounded-[10px] border border-transparent px-2.5 py-2 text-left transition-colors hover:bg-[color-mix(in_oklab,var(--color-paper)_60%,transparent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-border-strong)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
      style={active ? { backgroundColor: 'color-mix(in oklab, var(--color-ink) 6%, transparent)' } : undefined}
    >
      <PresenceDot live={agent.live} size={0.62} />
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-[13.5px] leading-tight ${active ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-2)] group-hover:text-[var(--color-ink)]'}`}
        >
          {agent.subname ? (
            <>
              {agent.subname}
              <span className="text-[var(--color-ink-3)]">.anima.0g</span>
            </>
          ) : (
            agent.displayName
          )}
        </span>
      </span>
      {agent.alive ? (
        <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-[var(--color-ink-3)]">
          {agent.alive}
        </span>
      ) : null}
    </button>
  )
}

function AgentDropdown({
  agents,
  activeTokenId,
  fallbackLabel,
  busy,
  onSelect,
}: {
  agents: ConsoleAgent[]
  activeTokenId: bigint
  fallbackLabel: string
  busy?: boolean
  onSelect: (a: ConsoleAgent) => void
}) {
  const [open, setOpen] = useState(false)
  const active = agents.find(a => a.tokenId === activeTokenId)
  const agentName = (a?: ConsoleAgent) =>
    a?.subname ? (
      <>
        {a.subname}
        <span className="text-[var(--color-ink-3)]">.anima.0g</span>
      </>
    ) : (
      (a?.displayName ?? fallbackLabel)
    )

  // One agent → a static identity row. The switch affordance (chevron + popover)
  // only appears when there's somewhere to switch, so the top of the rail reads
  // as pure presence + name, not a widget.
  if (agents.length <= 1) {
    return (
      <div className="flex w-full items-center gap-2.5 px-2.5 py-2">
        <PresenceDot live={active?.live ?? true} size={0.62} />
        <span className="min-w-0 flex-1 truncate text-[14px] leading-tight text-[var(--color-ink)]">
          {agentName(active)}
        </span>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !busy && setOpen(v => !v)}
        disabled={busy}
        style={open ? { backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-border)' } : undefined}
        className="group flex w-full items-center gap-2.5 rounded-[10px] border border-transparent px-2.5 py-2 text-left transition-colors hover:bg-[color-mix(in_oklab,var(--color-paper)_60%,transparent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-border-strong)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <PresenceDot live={active?.live ?? true} size={0.62} />
        <span className="min-w-0 flex-1 truncate text-[14px] leading-tight text-[var(--color-ink)]">
          {agentName(active)}
        </span>
        <span
          aria-hidden
          className={`shrink-0 text-[var(--color-ink-3)] transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m4 6 4 4 4-4" />
          </svg>
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <>
            {/* click-away */}
            <button
              type="button"
              aria-hidden
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-10 cursor-default"
            />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: DUR.fast, ease: EASE }}
              style={{ transformOrigin: 'top' }}
              className="no-scrollbar absolute inset-x-0 top-full z-20 mt-1 max-h-[58vh] overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-1.5 shadow-[0_8px_24px_-12px_rgba(var(--rgb-shadow),0.35)]"
            >
              <div className="flex flex-col gap-0.5">
                {agents.map(a => (
                  <AgentRow
                    key={a.tokenId.toString()}
                    agent={a}
                    active={a.tokenId === activeTokenId}
                    disabled={busy}
                    onSelect={ag => {
                      setOpen(false)
                      onSelect(ag)
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export function ConsoleChatShell({ tokenId }: { tokenId: bigint }) {
  const reduce = useReducedMotion() ?? false
  const router = useRouter()
  const siwe = useSiwe()
  const ctx = useAgentContext()
  const { agents } = useOwnedAgents()

  // Remember this agent as the operator's last chat, so /console/chat returns
  // them here next time without a pick.
  useEffect(() => {
    rememberLastAgent(tokenId)
  }, [tokenId])

  const { signMessageAsync } = useSignMessage()
  const signRef = useRef(signMessageAsync)
  signRef.current = signMessageAsync
  // A returning operator with a valid SIWE cookie lands here with wagmi
  // DISCONNECTED (the injected wallet doesn't persist across a hard nav), so a
  // signMessage would throw "connector not connected". Defensively reconnect the
  // injected wallet before signing. Refs keep signRaw STABLE so the relay client
  // (and its live SSE stream) is never rebuilt on a connection-state change.
  const { isConnected } = useAccount()
  const isConnectedRef = useRef(isConnected)
  isConnectedRef.current = isConnected
  const { connectAsync, connectors } = useConnect()
  const connectRef = useRef({ connectAsync, connectors })
  connectRef.current = { connectAsync, connectors }
  const ensureConnected = useCallback(async () => {
    if (isConnectedRef.current) return
    const { connectAsync: connect, connectors: list } = connectRef.current
    const injected = list.find(c => c.type === 'injected') ?? list[0]
    if (injected) {
      try {
        await connect({ connector: injected })
      } catch {
        /* fall through; signMessage will surface the real error */
      }
    }
  }, [])
  // signRaw = raw 32-byte digest (chat / approval / sync). signText = readable
  // text (device grant / revoke) — kura signs text with the real EOA key but
  // mangles a 32-byte raw personal_sign. Both stable (refs) so the relay client
  // is never rebuilt on connect-state change.
  const signRaw = useCallback(
    async (hash: Hex) => {
      await ensureConnected()
      return signRef.current({ message: { raw: hash } })
    },
    [ensureConnected],
  )
  const signText = useCallback(
    async (message: string) => {
      await ensureConnected()
      return signRef.current({ message })
    },
    [ensureConnected],
  )

  const [conn, setConn] = useState<ChatConnState>({ phase: 'loading' })
  const [connInfo, setConnInfo] = useState<ConnInfo | null>(null)
  // Turn-in-flight (reported by ChatPanel). While busy, agent + session
  // switching is locked so the agent-global SSE event stream can't bleed a
  // running turn's tool rows / approvals into a different session.
  const [busy, setBusy] = useState(false)
  // Mobile rail drawer (the desktop rail is max-md:hidden; on phones the same
  // rail content slides in as an overlay). Closes on any navigation + Escape.
  const [drawerOpen, setDrawerOpen] = useState(false)

  // ── Relay connection (server-side ownerOf gate → relayUrl + secret slug
  //    + optional readToken). One fetch per agent; the shell shares the
  //    resulting client across the session strip + ChatPanel. ────────────
  useEffect(() => {
    let cancelled = false
    setConn({ phase: 'loading' })
    setConnInfo(null)
    fetch(`/api/agent/${tokenId.toString()}/connection`, { credentials: 'include' })
      .then(async r => {
        const body = (await r.json().catch(() => ({}))) as {
          relayUrl?: string
          agentId?: string
          readToken?: string
          operator?: Address
          error?: string
        }
        if (cancelled) return
        if (r.ok && body.relayUrl && body.agentId) {
          setConnInfo({
            relayUrl: body.relayUrl,
            agentId: body.agentId,
            readToken: body.readToken,
            operator: body.operator,
          })
          setConn({ phase: 'ready' })
        } else if (r.status === 401) {
          setConn({ phase: 'error', reason: 'You do not own this agent.' })
        } else if (r.status === 503) {
          setConn({
            phase: 'error',
            reason:
              body.error === 'agent-not-web-enabled'
                ? 'This agent does not have web chat enabled yet. Enable the webapp gateway on the daemon and map its routing slug.'
                : 'The web gateway relay is not configured on this deployment.',
          })
        } else {
          setConn({ phase: 'error', reason: body.error ?? `connection failed (${r.status})` })
        }
      })
      .catch(() => !cancelled && setConn({ phase: 'error', reason: 'connection request failed' }))
    return () => {
      cancelled = true
    }
  }, [tokenId])

  const client = useMemo(
    () => (connInfo ? new RelayGatewayClient({ ...connInfo, signRaw, signText }) : null),
    [connInfo, signRaw, signText],
  )

  // v0.27 device write-auth: resolves whether writes need a signature, restores
  // a stored device token, and drives the "authorize once / manage devices" UI.
  const deviceAuth = useDeviceAuth(client, tokenId.toString())

  // ── Sessions. `main` is the always-present default thread; server sessions
  //    (channels with history) are listed + refreshed; New Session adds an
  //    optimistic local thread until its first turn persists it. ──────────
  const [serverSessions, setServerSessions] = useState<SessionMeta[]>([])
  const [localSessions, setLocalSessions] = useState<SessionMeta[]>([
    { id: 'main', title: 'Main', messageCount: 0 },
  ])
  const [activeSessionId, setActiveSessionId] = useState('main')

  const refreshSessions = useCallback(async () => {
    if (!client) return
    try {
      const list = await client.listSessions()
      setServerSessions(list)
    } catch {
      /* read route may be unavailable; keep local sessions */
    }
  }, [client])

  // Reset session state per agent + initial list load.
  useEffect(() => {
    setServerSessions([])
    setLocalSessions([{ id: 'main', title: 'Main', messageCount: 0 }])
    setActiveSessionId('main')
    void refreshSessions()
  }, [refreshSessions])

  const sessions = useMemo<SessionMeta[]>(() => {
    const byId = new Map<string, SessionMeta>()
    // local first (so 'main' + brand-new threads always show), server overrides
    // with real title/updatedAt where the channel has persisted history.
    for (const s of localSessions) byId.set(s.id, s)
    for (const s of serverSessions) byId.set(s.id, s)
    const all = [...byId.values()]
    // Most-recent first; threads without a persisted updatedAt (new/main-empty)
    // sort after active ones but stay visible.
    return all.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
  }, [localSessions, serverSessions])

  const newSession = useCallback(() => {
    if (busy) return
    setDrawerOpen(false)
    // Reuse the active thread if it's already a fresh, empty one (no server
    // history yet) instead of minting a pile of empty "New Session" entries.
    const active = serverSessions.find(s => s.id === activeSessionId)
    const isActiveEmptyLocal =
      !active &&
      (activeSessionId === 'main' ||
        localSessions.some(s => s.id === activeSessionId && s.messageCount === 0))
    if (isActiveEmptyLocal) return
    const id = crypto.randomUUID()
    setLocalSessions(prev => [{ id, title: 'New Session', messageCount: 0 }, ...prev])
    setActiveSessionId(id)
  }, [busy, serverSessions, localSessions, activeSessionId])

  const selectSession = useCallback(
    (id: string) => {
      if (busy) return
      setDrawerOpen(false)
      setActiveSessionId(id)
    },
    [busy],
  )

  // After a turn lands, refresh the server session list so titles/order update.
  // ChatPanel doesn't expose a turn callback, so poll lightly while connected.
  useEffect(() => {
    if (!client) return
    const t = setInterval(() => void refreshSessions(), 20_000)
    return () => clearInterval(t)
  }, [client, refreshSessions])

  // Re-mint the SSE read token before its ~1h bucket expires (only matters when
  // the daemon enforces read-auth). Re-fetches /connection and pushes the fresh
  // token into the existing client IN PLACE — never rebuilds the client (which
  // would reset the live stream + transcript).
  useEffect(() => {
    if (!client || !connInfo?.readToken) return
    const t = setInterval(
      () => {
        fetch(`/api/agent/${tokenId.toString()}/connection`, { credentials: 'include' })
          .then(r => (r.ok ? r.json() : null))
          .then((b: { readToken?: string } | null) => {
            if (b?.readToken) client.setReadToken(b.readToken)
          })
          .catch(() => {})
      },
      40 * 60 * 1000,
    )
    return () => clearInterval(t)
  }, [client, connInfo, tokenId])

  const selectAgent = useCallback(
    (a: ConsoleAgent) => {
      if (busy || a.tokenId === tokenId) return
      setDrawerOpen(false)
      router.push(`/console/${a.tokenId.toString()}/chat`)
    },
    [busy, router, tokenId],
  )

  // Close the mobile drawer on Escape.
  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  const subname = ctx.subname
  const displayName = subname ? `${subname}` : `Agent #${tokenId.toString()}`
  const operator = siwe.address

  // Rail content (agent switcher + sessions + device footer), shared by the
  // desktop aside and the mobile drawer so they never drift.
  const railContent = (
    <>
      <div className="px-2 pt-5 pb-3">
        <Link
          href="/console"
          className="font-wordmark text-[20px] leading-none text-[var(--color-ink)] transition-opacity hover:opacity-70"
          aria-label="All agents"
        >
          anima
        </Link>
      </div>

      {/* AGENTS — identity / switcher (the agent axis) */}
      <div className="pt-2 pb-1">
        <AgentDropdown
          agents={agents}
          activeTokenId={tokenId}
          fallbackLabel={displayName}
          busy={busy}
          onSelect={selectAgent}
        />
      </div>

      {/* SESSIONS — the conversation axis for the active agent */}
      <div className="px-2 pb-2 pt-6">
        <span className="kicker">Sessions</span>
      </div>
      <div className="pb-1">
        <button
          type="button"
          onClick={newSession}
          disabled={busy}
          className="group flex w-full items-center gap-2.5 rounded-[10px] border border-transparent px-2.5 py-2 text-left text-[13px] text-[var(--color-ink-2)] transition-colors hover:bg-[color-mix(in_oklab,var(--color-paper)_60%,transparent)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-border-strong)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span
            aria-hidden
            className="shrink-0 text-[var(--color-ink-3)] group-hover:text-[var(--color-ink-2)]"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3v10M3 8h10" />
            </svg>
          </span>
          New Session
        </button>
      </div>
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-3">
        <div className="flex flex-col gap-0.5">
          {sessions.map(s => {
            const active = s.id === activeSessionId
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => selectSession(s.id)}
                disabled={busy && !active}
                className={`group flex w-full items-center gap-2.5 rounded-[10px] border border-transparent px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-border-strong)] disabled:cursor-not-allowed disabled:opacity-50 ${
                  active
                    ? ''
                    : 'hover:bg-[color-mix(in_oklab,var(--color-paper)_60%,transparent)]'
                }`}
                style={
                  active
                    ? { backgroundColor: 'color-mix(in oklab, var(--color-ink) 6%, transparent)' }
                    : undefined
                }
              >
                <span
                  className={`min-w-0 flex-1 truncate text-[13px] leading-tight ${active ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-2)] group-hover:text-[var(--color-ink)]'}`}
                >
                  {s.title}
                </span>
                {s.updatedAt ? (
                  <span
                    className={`shrink-0 font-mono text-[10px] tabular-nums text-[var(--color-ink-3)] transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  >
                    {relTime(s.updatedAt)}
                  </span>
                ) : null}
              </button>
            )
          })}
          {sessions.length <= 1 && sessions[0]?.messageCount === 0 ? (
            <p className="px-2.5 pt-1.5 text-[11.5px] leading-snug text-[var(--color-ink-3)]">
              Your conversations with this agent appear here.
            </p>
          ) : null}
        </div>
      </div>

      {operator ? (
        <div className="pt-2 pb-3">
          {deviceAuth.mode === 'signed' ? (
            <DeviceManager
              operator={operator}
              presenceLive={conn.phase === 'ready'}
              deviceId={deviceAuth.deviceId}
              devices={deviceAuth.devices}
              onOpen={deviceAuth.refreshDevices}
              onRevoke={deviceAuth.revoke}
            />
          ) : (
            <div className="flex w-full items-center gap-2.5 px-2.5 py-2">
              <PresenceDot live={conn.phase === 'ready'} size={0.62} />
              <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-[var(--color-ink-2)]">
                {shortAddress(operator, 6, 4)}
              </span>
            </div>
          )}
        </div>
      ) : null}
    </>
  )

  return (
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-0 z-40 flex h-[100dvh] w-full overflow-hidden bg-[var(--color-cream)] text-[var(--color-ink)]">
        <PaperNoise />

      <div className="relative z-[2] flex h-full w-full">
        {/* ── LEFT RAIL: two tiers, clearly separated ──────────────────────
            AGENTS (which agent) on top, SESSIONS (which conversation, for the
            active agent) below. Two axes, two labelled sections, one rail. ── */}
        {/* desktop rail — hidden on phones (the drawer below replaces it) */}
        <aside className="flex w-[256px] shrink-0 flex-col bg-[var(--color-cream-deep)] px-3 max-md:hidden">
          {railContent}
        </aside>

        {/* ── MOBILE DRAWER: same rail content as an overlay ───────────── */}
        <AnimatePresence>
          {drawerOpen ? (
            <motion.div
              key="rail-scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DUR.fast, ease: EASE }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-[rgba(20,18,12,0.4)] md:hidden"
              aria-hidden
            />
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {drawerOpen ? (
            <motion.aside
              key="rail-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: DUR.base, ease: EASE }}
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[82%] flex-col bg-[var(--color-cream-deep)] px-3 shadow-[var(--shadow-doc)] md:hidden"
            >
              {railContent}
            </motion.aside>
          ) : null}
        </AnimatePresence>

        {/* ── MAIN: identity + chat ────────────────────────────────────── */}
        <main className="flex min-h-0 flex-1 flex-col">
          {/* mobile top bar: hamburger opens the rail drawer */}
          <div className="flex shrink-0 items-center gap-3 px-4 pt-4 md:hidden">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="-ml-1 rounded-[10px] p-1.5 text-[var(--color-ink-2)] transition-colors hover:bg-[color-mix(in_oklab,var(--color-ink)_6%,transparent)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-border-strong)]"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              >
                <path d="M3 6h14M3 10h14M3 14h14" />
              </svg>
            </button>
            <Link
              href="/console"
              className="font-wordmark text-[18px] leading-none text-[var(--color-ink)]"
              aria-label="All agents"
            >
              anima
            </Link>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tokenId.toString()}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: DUR.base, ease: EASE }}
              className="shrink-0 pt-3 pb-5 text-left md:pt-6"
            >
              <div className="mx-auto w-full max-w-[720px] px-5 sm:px-9">
              <h1
                className="font-display text-[19px] font-light leading-none tracking-[-0.01em] text-[var(--color-ink)]"
                style={fv(20)}
              >
                {displayName}
                {subname ? <span className="text-[var(--color-ink-3)]">.anima.0g</span> : null}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11.5px] text-[var(--color-ink-3)]">
                {ctx.agentEOA ? <span>{shortAddress(ctx.agentEOA, 6, 4)}</span> : null}
                {ctx.agentEOA ? <span aria-hidden>·</span> : null}
                <span className="inline-flex items-center gap-1.5">
                  <PresenceDot live={conn.phase === 'ready'} />
                  {conn.phase === 'ready'
                    ? 'connected'
                    : conn.phase === 'loading'
                      ? 'connecting'
                      : 'offline'}
                </span>
              </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex min-h-0 flex-1 flex-col">
            <ChatPanel
              key={`${tokenId.toString()}:${activeSessionId}`}
              client={client}
              connState={conn}
              sessionId={activeSessionId}
              onPendingChange={setBusy}
              composerOverride={
                deviceAuth.needsAuth ? (
                  <div className="mx-auto w-full max-w-[720px] px-5 sm:px-9">
                    <AuthorizeDevice
                      granting={deviceAuth.granting}
                      error={deviceAuth.error}
                      onGrant={(expiresAt, label) => void deviceAuth.grant(expiresAt, label)}
                    />
                  </div>
                ) : undefined
              }
              onWriteUnauthorized={deviceAuth.onUnauthorized}
              emptySub={
                deviceAuth.needsAuth
                  ? 'Authorize this device to start chatting on the live agent.'
                  : "You're connected from this browser, anywhere, and chatting on the live agent."
              }
              className="relative flex h-full w-full flex-col pb-6 pt-1"
            />
          </div>
        </main>
      </div>
      </div>
    </MotionConfig>
  )
}
