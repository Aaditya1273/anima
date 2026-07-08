'use client'

// Shared, refined chat primitives used by the real console ChatPanel AND the
// /mocks design + live pages, so polish lands in one place. Editorial palette
// throughout (--color-* tokens, Fraunces/Outfit/Geist Mono); Claude/ChatGPT
// layout paradigm: centered column, full-width agent prose, understated user
// turns, one composer with the send control inside.
//
// Interaction logic ported from pragma-v2-stable, rendered entirely in anima's
// ink/cream vocabulary: paced reveal of the assistant blob, turn-boundary copy +
// retry, a state-aware composer whose send arrow morphs to a stop while a turn
// runs, and a warm (never-red) error row.

import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { DUR, EASE } from '@/lib/motion'
import { MarkdownRenderer } from './MarkdownRenderer'
import { ThinkingIndicator } from './ThinkingIndicator'
import { useRevealedText } from './useRevealedText'

export { EASE }

export type ToolStatus = 'running' | 'ok' | 'failed'
export type ChatItem =
  // `instant` marks turns SEEDED from history (a session switch / reload) so they
  // render fully at once — no entrance animation, no paced typewriter reveal.
  // Live turns omit it and animate normally.
  | { kind: 'op'; id: string; text: string; instant?: boolean }
  | { kind: 'assistant'; id: string; text: string; instant?: boolean }
  | {
      kind: 'tool'
      id: string
      callId: string
      name: string
      status: ToolStatus
      durationMs?: number
    }
  | { kind: 'note'; id: string; text: string }
  | { kind: 'error'; id: string; text: string; retry?: string }

export function AnimaMark({ size = 28 }: { size?: number }) {
  return (
    <span
      className="grid shrink-0 select-none place-items-center rounded-full bg-[var(--color-ink)] font-wordmark leading-none text-[var(--color-cream)]"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      a
    </span>
  )
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-6 w-6 place-items-center rounded-md text-[var(--color-ink-3)] transition hover:bg-[color-mix(in_oklab,var(--color-ink)_5%,transparent)] hover:text-[var(--color-ink-2)]"
    >
      {children}
    </button>
  )
}

// One quiet action row anchored to the END of an agent turn. Copy grabs the
// whole turn's prose (not a single fragment); retry re-runs the preceding op.
function TurnActions({ copyText, onRetry }: { copyText: string; onRetry?: () => void }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="-ml-1 flex items-center gap-0.5 pt-1.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
      <IconButton
        label="Copy reply"
        onClick={() => {
          navigator.clipboard?.writeText(copyText).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 1400)
          })
        }}
      >
        {copied ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20 6 9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect
              x="9"
              y="9"
              width="11"
              height="11"
              rx="2.5"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M5 15V5a2 2 0 0 1 2-2h10"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        )}
      </IconButton>
      {onRetry ? (
        <IconButton label="Retry this turn" onClick={onRetry}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3 12a9 9 0 1 0 3-6.7L3 8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 3v5h5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </IconButton>
      ) : null}
    </div>
  )
}

function ToolRow({
  name,
  status,
  durationMs,
}: { name: string; status: ToolStatus; durationMs?: number }) {
  const glyph = status === 'running' ? '▸' : '↳'
  const label = status === 'running' ? 'running' : status
  return (
    <div className="flex items-center gap-1.5 font-mono text-[12px] text-[var(--color-ink-3)]">
      <span className={status === 'running' ? 'anima-thinking-shimmer' : ''}>{glyph}</span>
      <span className="text-[var(--color-ink-2)]">{name}</span>
      {status === 'failed' ? (
        <span className="text-[var(--color-ink)] underline decoration-[var(--color-border-strong)]">
          {label}
        </span>
      ) : (
        <span className="text-[var(--color-ink-3)]">{label}</span>
      )}
      {status === 'ok' && typeof durationMs === 'number' ? (
        <span className="text-[var(--color-ink-3)] tabular-nums">
          · {formatDuration(durationMs)}
        </span>
      ) : null}
    </div>
  )
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)}s`
}

// Warm, never-red terminal state with an inline retry. Uses a frozen star glyph
// (motion decayed to rest = done) rather than an alarming colored note.
function ErrorRow({ text, onRetry }: { text: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[12.5px] text-[var(--color-ink-2)]">
      <span className="text-[var(--color-ink-3)]" aria-hidden="true">
        ✦
      </span>
      <span>{text}</span>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="text-[var(--color-ink)] underline decoration-[var(--color-border-strong)] underline-offset-[3px] transition hover:decoration-[var(--color-ink)]"
        >
          retry
        </button>
      ) : null}
    </div>
  )
}

// A single revealed assistant fragment (paces the final string into bursts).
// `instant` (seeded history) renders the whole string at once — no replayed
// typewriter when switching back into an existing thread.
function AssistantBody({ text, instant }: { text: string; instant?: boolean }) {
  const { shown, done } = useRevealedText(text, !instant)
  return <MarkdownRenderer content={shown} isAnimating={!done} />
}

type Group =
  | { side: 'user'; items: ChatItem[] }
  | { side: 'agent'; items: ChatItem[]; retryText?: string }

function groupTurns(items: ChatItem[]): Group[] {
  const groups: Group[] = []
  let lastUserText: string | undefined
  for (const it of items) {
    if (it.kind === 'op') {
      lastUserText = it.text
      const last = groups[groups.length - 1]
      if (last && last.side === 'user') last.items.push(it)
      else groups.push({ side: 'user', items: [it] })
    } else {
      const last = groups[groups.length - 1]
      if (last && last.side === 'agent') last.items.push(it)
      else groups.push({ side: 'agent', items: [it], retryText: lastUserText })
    }
  }
  return groups
}

function AgentTurn({
  items,
  thinking,
  retryText,
  onRetry,
  instant,
}: {
  items: ChatItem[]
  thinking?: boolean
  retryText?: string
  onRetry?: (text: string) => void
  instant?: boolean
}) {
  const assistantText = items
    .filter(it => it.kind === 'assistant')
    .map(it => (it.kind === 'assistant' ? it.text : ''))
    .join('\n\n')
  const hasAssistant = assistantText.length > 0
  return (
    <motion.div
      initial={instant ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.base, ease: EASE }}
      className="group min-w-0 space-y-2.5"
    >
        {items.map(it => {
          if (it.kind === 'tool')
            return (
              <ToolRow key={it.id} name={it.name} status={it.status} durationMs={it.durationMs} />
            )
          if (it.kind === 'note')
            return (
              <div key={it.id} className="font-mono text-[12px] text-[var(--color-ink-3)]">
                {it.text}
              </div>
            )
          if (it.kind === 'error')
            return (
              <ErrorRow
                key={it.id}
                text={it.text}
                onRetry={it.retry && onRetry ? () => onRetry(it.retry as string) : undefined}
              />
            )
          if (it.kind === 'assistant')
            return <AssistantBody key={it.id} text={it.text} instant={it.instant} />
          return null
        })}
        {thinking ? <ThinkingIndicator /> : null}
        {hasAssistant && !thinking ? (
          <TurnActions
            copyText={assistantText}
            onRetry={retryText && onRetry ? () => onRetry(retryText) : undefined}
          />
        ) : null}
    </motion.div>
  )
}

function UserTurn({ items, instant }: { items: ChatItem[]; instant?: boolean }) {
  return (
    <div className="flex flex-col items-end gap-1.5">
      {items.map(it => (
        <motion.div
          key={it.id}
          initial={instant ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.base, ease: EASE }}
          className="max-w-[80%] rounded-[18px] rounded-br-sm bg-[var(--color-cream-deep)] px-4 py-2.5 text-[15px] leading-[1.55] text-[var(--color-ink)]"
        >
          {it.kind === 'op' ? it.text : null}
        </motion.div>
      ))}
    </div>
  )
}

export function Transcript({
  items,
  pending,
  onRetry,
}: {
  items: ChatItem[]
  pending: boolean
  onRetry?: (text: string) => void
}) {
  const groups = groupTurns(items)
  const lastIsUser = items[items.length - 1]?.kind === 'op'
  return (
    <div className="flex flex-col gap-10">
      {groups.map((g, i) => {
        const key = g.items[0]?.id ?? `g${i}`
        const isLast = i === groups.length - 1
        // A group seeded from history (all its op/assistant items carry `instant`)
        // renders at once. After a switch the transcript is homogeneous (cleared
        // then seeded), so this never mixes a live turn into a seeded group.
        const instant = g.items.some(
          it => (it.kind === 'op' || it.kind === 'assistant') && it.instant,
        )
        if (g.side === 'user') return <UserTurn key={key} items={g.items} instant={instant} />
        return (
          <AgentTurn
            key={key}
            items={g.items}
            retryText={g.retryText}
            onRetry={onRetry}
            thinking={pending && isLast && !lastIsUser}
            instant={instant}
          />
        )
      })}
      {/* pending right after a user turn → fresh agent turn with just the spinner */}
      {pending && lastIsUser ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.base, ease: EASE }}
        >
          <ThinkingIndicator />
        </motion.div>
      ) : null}
    </div>
  )
}

// Floating "jump to latest" affordance, shown by the caller when the operator
// has scrolled up mid-turn. Flat ink ring, no drop-shadow beyond the soft
// composer treatment — never a glassy floating glow.
export function ScrollToBottomPill({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      aria-label="Scroll to latest"
      onClick={onClick}
      initial={{ opacity: 0, y: 6, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.9 }}
      transition={{ duration: 0.2, ease: EASE }}
      className="grid h-8 w-8 place-items-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-paper)] text-[var(--color-ink-2)] shadow-[0_8px_28px_-22px_rgba(16,15,9,0.45)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)]"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 5v14M5 12l7 7 7-7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.button>
  )
}

export function EmptyState({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p
        className="font-display font-light leading-[1.15] text-[var(--color-ink)]"
        style={{
          fontSize: 'clamp(24px,2.6vw,32px)',
          fontVariationSettings: '"opsz" 80, "SOFT" 24, "WONK" 0',
        }}
      >
        {title}
      </p>
      <p className="max-w-[46ch] text-[14px] leading-[1.6] text-[var(--color-ink-3)]">{sub}</p>
    </div>
  )
}

export function Composer({
  value,
  onChange,
  onSend,
  onStop,
  pending = false,
  blocked = false,
  hasMessages = false,
}: {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  onStop?: () => void
  pending?: boolean
  blocked?: boolean
  hasMessages?: boolean
}) {
  const empty = value.trim().length === 0
  const canSend = !blocked && !pending && !empty

  const placeholder = useMemo(() => {
    if (blocked) return 'connecting to your agent…'
    if (hasMessages) return 'what else?'
    return 'Message your agent…'
  }, [blocked, hasMessages])

  return (
    <div className="pt-4">
      <div className="relative flex items-end rounded-[26px] border border-[var(--color-border)] bg-[var(--color-paper)] py-3.5 pl-5 pr-[54px] shadow-[var(--shadow-card)]">
        <textarea
          rows={1}
          value={value}
          disabled={blocked}
          onChange={e => {
            onChange(e.target.value)
            const t = e.target
            // Recenter to one line when cleared; otherwise grow to content.
            if (!t.value.trim()) {
              t.style.height = ''
            } else {
              t.style.height = '0px'
              t.style.height = `${Math.min(t.scrollHeight, 200)}px`
            }
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (canSend) onSend()
            }
          }}
          placeholder={placeholder}
          className="max-h-[200px] w-full resize-none bg-transparent font-body text-[15.5px] leading-[1.7] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-3)] disabled:opacity-50"
        />
        <div className="absolute bottom-2 right-2 h-9 w-9">
          <AnimatePresence mode="wait" initial={false}>
            {pending ? (
              <motion.button
                key="stop"
                type="button"
                aria-label="Stop"
                onClick={onStop}
                disabled={!onStop}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: DUR.xfast, ease: EASE }}
                className="grid h-9 w-9 place-items-center rounded-full bg-[var(--color-ink)] text-[var(--color-cream)] transition-transform hover:-translate-y-px active:scale-95 disabled:cursor-default"
              >
                <span
                  className="block h-[11px] w-[11px] rounded-[2px] bg-current"
                  aria-hidden="true"
                />
              </motion.button>
            ) : (
              <motion.button
                key="send"
                type="button"
                aria-label="Send"
                // Always solid ink — no grey-out on empty input. Sending an empty
                // message is a no-op (the parent's send() guards it), so the
                // control stays visually confident rather than dimmed.
                onClick={onSend}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: DUR.xfast, ease: EASE }}
                className="group/send grid h-9 w-9 place-items-center rounded-full bg-[var(--color-ink)] text-[var(--color-cream)] transition-[transform,box-shadow] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:shadow-[0_6px_16px_-8px_rgba(16,15,9,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-strong)] active:scale-95"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="transition-transform group-active/send:-rotate-45"
                >
                  <path
                    d="M12 19V5M12 5l-6 6M12 5l6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
