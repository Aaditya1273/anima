'use client'

// Live chat surface for one agent SESSION. Controlled: the parent
// (ConsoleChatShell) owns the relay connection + RelayGatewayClient + the
// active sessionId, so the agent rail and session strip share one connection
// and the chat re-keys per session. This component keeps the transcript,
// intent-aware scroll, SSE tool-row/approval handling, and the approval modal.
//
// On a session switch (sessionId change) the transcript is cleared and
// rehydrated from the daemon (client.getHistory) so a thread resumes across
// reloads. Per-message chat is signed with the operator wallet by the client.

import { RelayGatewayClient } from '@/lib/gateway/relay-client'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  type ChatItem,
  Composer,
  EASE,
  EmptyState,
  ScrollToBottomPill,
  type ToolStatus,
  Transcript,
} from './parts'

export type ChatConnState =
  | { phase: 'loading' }
  | { phase: 'ready' }
  | { phase: 'error'; reason: string }

interface PendingApproval {
  id: string
  payload: {
    kind?: string
    command?: string
    path?: string
    amount?: string
    recipient?: string
    token?: string
    reason?: string
  }
  expiresAt?: number
}

let _idSeq = 0
const nextId = () => `m${++_idSeq}-${Date.now()}`

// Centered content column. The scroll VIEWPORT is full-width (so its scrollbar
// sits at the panel's right edge, Claude/ChatGPT style), while the transcript,
// composer, and empty state are centered to this column inside it.
const CENTER = 'mx-auto w-full max-w-[720px] px-5 sm:px-9'

export function ChatPanel({
  client,
  connState,
  sessionId,
  className = 'relative mx-auto flex h-full w-full max-w-[720px] flex-col',
  onPendingChange,
  composerOverride,
  onWriteUnauthorized,
  emptySub = "You're connected from this browser, anywhere, and chatting on the live agent.",
}: {
  client: RelayGatewayClient | null
  connState: ChatConnState
  /** Active session id; turns route to channelKey `web:<sessionId>`. */
  sessionId: string
  className?: string
  /**
   * Reports turn-in-flight state to the shell so it can lock session/agent
   * switching while a turn runs. Locking is what keeps the agent-global SSE
   * tool-row/approval stream from bleeding into another session: a switch can
   * only happen between turns, never mid-turn.
   */
  onPendingChange?: (pending: boolean) => void
  /**
   * v0.27: when the daemon enforces write-auth and this device holds no token,
   * the shell passes an "Authorize this device" card to render IN PLACE of the
   * composer. When unset, the normal composer shows.
   */
  composerOverride?: React.ReactNode
  /** Called when a write 401s (device token revoked/expired) so the shell can re-prompt. */
  onWriteUnauthorized?: () => void
  /** Composer hint line (varies with write-auth mode). */
  /** Empty-state subtitle (varies with write-auth mode). */
  emptySub?: string
}) {
  const reduce = useReducedMotion()

  const [items, setItems] = useState<ChatItem[]>([])
  const [pending, setPending] = useState(false)
  const [approval, setApproval] = useState<PendingApproval | null>(null)
  const [input, setInput] = useState('')
  const [showJump, setShowJump] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const approvalRef = useRef<PendingApproval | null>(null)
  approvalRef.current = approval
  const abortRef = useRef<AbortController | null>(null)

  // Intent-aware scroll state (refs so the SSE/reveal paths read live values).
  const userScrolledUpRef = useRef(false)
  const lastScrollTopRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const prevLenRef = useRef(0)

  // Session switch / connect: clear the transcript and rehydrate from the
  // daemon so the thread resumes. Skips gracefully when read routes aren't
  // available (older daemon / no readToken).
  useEffect(() => {
    if (!client) return
    let cancelled = false
    // Abort any in-flight turn from the previous session so its late response
    // can't land in this one (the shell also blocks switching while pending,
    // so this is belt-and-suspenders).
    abortRef.current?.abort()
    setItems([])
    setPending(false)
    setApproval(null)
    userScrolledUpRef.current = false
    prevLenRef.current = 0
    setShowJump(false)
    ;(async () => {
      try {
        const turns = await client.getHistory(sessionId)
        if (cancelled || turns.length === 0) return
        const seeded = turns.map(t =>
          t.role === 'user'
            ? ({ kind: 'op', id: nextId(), text: t.content, instant: true } as ChatItem)
            : ({ kind: 'assistant', id: nextId(), text: t.content, instant: true } as ChatItem),
        )
        // Only seed if the transcript is still empty — never clobber live
        // tool rows / messages the SSE or a send added since mount.
        setItems(prev => (prev.length === 0 ? seeded : prev))
      } catch {
        /* no history route / unauthorized — start empty */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [client, sessionId])

  // Surface turn-in-flight state to the shell (session-switch lock).
  useEffect(() => {
    onPendingChange?.(pending)
  }, [pending, onPendingChange])

  useEffect(() => {
    if (!client) return
    const ac = new AbortController()
    ;(async () => {
      for await (const ev of client.events({ signal: ac.signal })) {
        const d = (ev.data ?? {}) as Record<string, unknown>
        if (ev.kind === 'tool-call-start') {
          const callId = String(d.callId ?? d.id ?? ev.seq)
          const name = typeof d.name === 'string' ? d.name : 'tool'
          setItems(prev => [
            ...prev,
            { kind: 'tool', id: nextId(), callId, name, status: 'running' },
          ])
        } else if (ev.kind === 'tool-call-end') {
          const callId = d.callId != null || d.id != null ? String(d.callId ?? d.id) : null
          const name = typeof d.name === 'string' ? d.name : null
          const status: ToolStatus = d.ok === false ? 'failed' : 'ok'
          const durationMs = typeof d.durationMs === 'number' ? d.durationMs : undefined
          setItems(prev => {
            const next = [...prev]
            for (let i = next.length - 1; i >= 0; i--) {
              const it = next[i]
              if (it.kind !== 'tool' || it.status !== 'running') continue
              if (
                (callId && it.callId === callId) ||
                (!callId && name && it.name === name) ||
                (!callId && !name)
              ) {
                next[i] = { ...it, status, durationMs }
                break
              }
            }
            return next
          })
        } else if (ev.kind === 'approval-needed') {
          setApproval({
            id: String(d.id),
            payload: (d.payload ?? {}) as PendingApproval['payload'],
            expiresAt: typeof d.expiresAt === 'number' ? d.expiresAt : undefined,
          })
        } else if (ev.kind === 'approval-resolved' || ev.kind === 'approval-expired') {
          if (approvalRef.current && String(d.id) === approvalRef.current.id) setApproval(null)
        }
      }
    })()
    return () => ac.abort()
  }, [client])

  // ── Intent-aware scroll ──────────────────────────────────────────────
  const stick = useCallback(
    (smooth: boolean) => {
      if (userScrolledUpRef.current) return
      if (rafRef.current != null) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        const el = scrollRef.current
        if (el)
          el.scrollTo({ top: el.scrollHeight, behavior: smooth && !reduce ? 'smooth' : 'auto' })
      })
    },
    [reduce],
  )

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
    const atBottom = distance < 100
    if (el.scrollTop < lastScrollTopRef.current - 5) userScrolledUpRef.current = true
    if (atBottom) userScrolledUpRef.current = false
    lastScrollTopRef.current = el.scrollTop
    setShowJump(!atBottom)
  }, [])

  useEffect(() => {
    const el = contentRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => stick(false))
    ro.observe(el)
    return () => ro.disconnect()
  }, [stick])

  useEffect(() => {
    const len = items.length
    const grew = len > prevLenRef.current
    const lastIsOp = items[len - 1]?.kind === 'op'
    prevLenRef.current = len
    if (grew && lastIsOp) {
      userScrolledUpRef.current = false
      setShowJump(false)
      stick(true)
    }
  }, [items, stick])

  const send = useCallback(
    async (explicit?: string) => {
      const message = (explicit ?? input).trim()
      if (!message || !client || pending) return
      if (explicit == null) setInput('')

      if (message === '/sync') {
        setItems(prev => [...prev, { kind: 'op', id: nextId(), text: message }])
        setPending(true)
        try {
          const r = await client.sync()
          setItems(prev => [
            ...prev,
            {
              kind: 'note',
              id: nextId(),
              text: r.tx ? `synced · tx ${r.tx.slice(0, 12)}…` : 'sync queued',
            },
          ])
        } catch (e) {
          setItems(prev => [
            ...prev,
            { kind: 'note', id: nextId(), text: `sync failed: ${(e as Error).message}` },
          ])
        } finally {
          setPending(false)
        }
        return
      }

      setItems(prev => [...prev, { kind: 'op', id: nextId(), text: message }])
      setPending(true)
      const ac = new AbortController()
      abortRef.current = ac
      try {
        const res = await client.chat(message, { signal: ac.signal, sessionId })
        setItems(prev => [...prev, { kind: 'assistant', id: nextId(), text: res.response }])
      } catch (e) {
        const err = e as Error
        if (err.name === 'AbortError') {
          setItems(prev => [...prev, { kind: 'note', id: nextId(), text: 'stopped' }])
        } else if (/\b401\b/.test(err.message)) {
          // Device token revoked/expired mid-session → re-prompt to authorize.
          onWriteUnauthorized?.()
          setItems(prev => [
            ...prev,
            { kind: 'error', id: nextId(), text: 'this device needs to be re-authorized', retry: message },
          ])
        } else {
          setItems(prev => [
            ...prev,
            { kind: 'error', id: nextId(), text: 'couldn’t reach the agent', retry: message },
          ])
        }
      } finally {
        abortRef.current = null
        setPending(false)
      }
    },
    [client, pending, input, sessionId, onWriteUnauthorized],
  )

  const stop = useCallback(() => abortRef.current?.abort(), [])
  const onRetry = useCallback((text: string) => void send(text), [send])

  const respondApproval = useCallback(
    async (decision: 'allow' | 'allow-session' | 'deny') => {
      const ap = approvalRef.current
      if (!ap || !client) return
      setApproval(null)
      try {
        await client.approve(ap.id, decision)
      } catch {
        /* daemon re-emits or expires */
      }
    },
    [client],
  )

  if (connState.phase === 'loading')
    return <ChatNotice label="Chat · Connecting">Resolving the relay connection…</ChatNotice>
  if (connState.phase === 'error')
    return <ChatNotice label="Chat · Unavailable">{connState.reason}</ChatNotice>

  const empty = items.length === 0 && !pending
  const composer = (
    <Composer
      value={input}
      onChange={setInput}
      onSend={() => send()}
      onStop={stop}
      pending={pending}
      blocked={!client}
      hasMessages={items.length > 0}
    />
  )

  return (
    <>
      <div className={className}>
        {empty ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
            <EmptyState title="What should your agent do?" sub={emptySub} />
          </div>
        ) : (
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="subtle-scroll flex min-h-0 flex-1 flex-col overflow-y-auto pb-10"
          >
            <div ref={contentRef} className={CENTER}>
              <Transcript items={items} pending={pending} onRetry={onRetry} />
            </div>
          </div>
        )}
        {composerOverride ?? <div className={CENTER}>{composer}</div>}

        <AnimatePresence>
          {showJump && !empty ? (
            <div
              className="pointer-events-none absolute inset-x-0 flex justify-center"
              style={{ bottom: 108 }}
            >
              <div className="pointer-events-auto">
                <ScrollToBottomPill
                  onClick={() => {
                    userScrolledUpRef.current = false
                    setShowJump(false)
                    stick(true)
                  }}
                />
              </div>
            </div>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {approval ? <ApprovalModal approval={approval} onRespond={respondApproval} /> : null}
      </AnimatePresence>
    </>
  )
}

function ApprovalModal({
  approval,
  onRespond,
}: {
  approval: PendingApproval
  onRespond: (d: 'allow' | 'allow-session' | 'deny') => void
}) {
  const p = approval.payload
  const detail = p.command ?? p.path ?? p.recipient ?? ''
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: EASE }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(var(--rgb-shadow-strong)/0.5)] p-4 sm:items-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.28, ease: EASE }}
        className="w-full max-w-[460px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-6 shadow-[var(--shadow-doc)]"
      >
        <span className="kicker">Approval Needed</span>
        <p
          className="mt-3 font-display font-light leading-[1.2] text-[var(--color-ink)]"
          style={{ fontSize: '24px', fontVariationSettings: '"opsz" 72, "SOFT" 20, "WONK" 0' }}
        >
          {p.kind ?? 'tool call'}
        </p>
        {detail ? (
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2 font-mono text-[12.5px] leading-[1.6] text-[var(--color-ink-2)]">
            {detail}
          </pre>
        ) : null}
        {p.amount || p.recipient || p.token ? (
          <p className="mt-2 font-mono text-[12.5px] text-[var(--color-ink-2)]">
            {[
              p.amount && `amount ${p.amount}`,
              p.token && `token ${p.token}`,
              p.recipient && `to ${p.recipient}`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        ) : null}
        {p.reason ? (
          <p className="mt-2 text-[13.5px] leading-[1.6] text-[var(--color-ink-2)]">{p.reason}</p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onRespond('allow')}
            className="inline-flex items-center rounded-full bg-[var(--color-ink)] px-4 py-2 text-[13px] font-medium text-[var(--color-cream)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-strong)] active:scale-[0.99]"
          >
            Allow once
          </button>
          <button
            type="button"
            onClick={() => onRespond('allow-session')}
            className="inline-flex items-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-cream)] px-4 py-2 text-[13px] font-medium text-[var(--color-ink)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-strong)] active:scale-[0.99]"
          >
            Allow for session
          </button>
          <button
            type="button"
            onClick={() => onRespond('deny')}
            className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-2 text-[13px] font-medium text-[var(--color-ink-2)] transition hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-strong)]"
          >
            Deny
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ChatNotice({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-[720px] gap-3 pt-6">
      <span className="kicker">{label}</span>
      <p className="max-w-[52ch] text-[15.5px] leading-[1.65] text-[var(--color-ink-2)]">
        {children}
      </p>
    </div>
  )
}
