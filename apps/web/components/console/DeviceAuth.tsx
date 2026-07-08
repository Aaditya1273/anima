'use client'

// v0.27 device write-auth UI. Two pieces, both operator-scoped:
//   - AuthorizeDevice: the one-time "sign once, then chat" card shown in place
//     of the composer when the daemon enforces write-auth and this browser holds
//     no device token yet. Pick a lifetime, sign ONCE, and chat freely after.
//   - DeviceManager: a footer popover listing authorized devices with per-row
//     revoke (operator-scoped, so it lives by the operator identity, not the
//     per-conversation session strip).
// Style: no forced-serif filler, Geist Mono for data, Title Case, whitespace
// over hairlines (per the locked console style rules).

import { shortAddress } from '@/lib/format'
import type { DeviceListing } from '@/lib/gateway/relay-client'
import { DUR, EASE } from '@/lib/motion'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const DAY = 24 * 60 * 60 * 1000

interface TtlPreset {
  key: string
  label: string
  ttlMs: number | null // null = never
}

// No "never" preset: the daemon defaults to a finite 30-day ceiling and rejects
// never-expire device tokens, so an unbounded option would only error.
const TTL_PRESETS: TtlPreset[] = [
  { key: '1d', label: '1 Day', ttlMs: DAY },
  { key: '7d', label: '7 Days', ttlMs: 7 * DAY },
  { key: '30d', label: '30 Days', ttlMs: 30 * DAY },
]

function relFuture(expiresAt: number): string {
  if (expiresAt === 0) return 'never expires'
  const ms = expiresAt - Date.now()
  if (ms <= 0) return 'expired'
  const days = Math.round(ms / DAY)
  if (days >= 1) return `expires in ${days}d`
  const hours = Math.max(1, Math.round(ms / (60 * 60 * 1000)))
  return `expires in ${hours}h`
}

function relPast(ts: number): string {
  const ms = Date.now() - ts
  if (ms < 60_000) return 'just now'
  const mins = Math.round(ms / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(ms / (60 * 60 * 1000))
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(ms / DAY)}d ago`
}

export function AuthorizeDevice({
  granting,
  error,
  onGrant,
}: {
  granting: boolean
  error: string | null
  onGrant: (expiresAt: number, label: string) => void
}) {
  const [preset, setPreset] = useState('30d')
  const [label, setLabel] = useState('')

  const submit = () => {
    const chosen = TTL_PRESETS.find(p => p.key === preset) ?? TTL_PRESETS[2]
    const expiresAt = chosen.ttlMs === null ? 0 : Date.now() + chosen.ttlMs
    onGrant(expiresAt, label.trim() || 'This Device')
  }

  return (
    <div className="mx-auto w-full max-w-[560px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] px-6 py-5">
      <h2
        className="font-display text-[19px] font-light leading-tight text-[var(--color-ink)]"
        style={{ fontVariationSettings: '"opsz" 28, "SOFT" 30, "WONK" 0' }}
      >
        Authorize This Device
      </h2>
      <p className="mt-2 text-[13.5px] leading-[1.6] text-[var(--color-ink-2)]">
        Sign once with your wallet to authorize this browser. After that, your messages send
        without a signature until the pass expires.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="kicker">Keep Me Signed In For</span>
          <div className="flex flex-wrap gap-1.5">
            {TTL_PRESETS.map(p => {
              const active = p.key === preset
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPreset(p.key)}
                  disabled={granting}
                  className={`rounded-full border px-3 py-1.5 text-[12.5px] leading-none transition-colors disabled:opacity-50 ${
                    active
                      ? 'border-[var(--color-border-strong)] bg-[var(--color-cream)] text-[var(--color-ink)]'
                      : 'border-[var(--color-border)] text-[var(--color-ink-3)] hover:text-[var(--color-ink-2)]'
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="kicker">Device Name (optional)</span>
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            disabled={granting}
            placeholder="e.g. MacBook"
            maxLength={64}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2 font-mono text-[13px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-3)] focus:border-[var(--color-border-strong)] disabled:opacity-50"
          />
        </label>
      </div>

      {error ? (
        <p className="mt-3 flex items-center gap-2 text-[12px] leading-[1.5] text-[var(--color-ink-2)]">
          <span className="text-[var(--color-ink-3)]" aria-hidden>
            ✦
          </span>
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={submit}
        disabled={granting}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-4 py-2 text-[13px] font-medium text-[var(--color-cream)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-strong)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {granting ? 'Waiting For Signature…' : 'Authorize This Device'}
      </button>
    </div>
  )
}

export function DeviceManager({
  operator,
  presenceLive,
  deviceId,
  devices,
  onOpen,
  onRevoke,
}: {
  operator: string
  presenceLive: boolean
  deviceId: string
  devices: DeviceListing[]
  onOpen: () => void
  onRevoke: (tokenId: string) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    if (open) onOpen()
  }, [open, onOpen])

  const active = devices.filter(d => !d.revoked)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="group flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left transition-colors hover:bg-[color-mix(in_oklab,var(--color-paper)_60%,transparent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-border-strong)]"
        aria-label="Authorized devices"
      >
        <span
          aria-hidden
          className={presenceLive ? 'text-[var(--color-ink-2)]' : 'text-[var(--color-ink-3)]'}
          style={{ fontSize: '0.62em', lineHeight: 1 }}
        >
          ●
        </span>
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-[var(--color-ink-2)]">
          {shortAddress(operator, 6, 4)}
        </span>
        {active.length ? (
          <span className="shrink-0 font-mono text-[10px] tabular-nums text-[var(--color-ink-3)]">
            {active.length}
          </span>
        ) : null}
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
            <path d="m4 10 4-4 4 4" />
          </svg>
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: DUR.fast, ease: EASE }}
            style={{ transformOrigin: 'bottom' }}
            className="absolute bottom-full left-0 z-10 mb-2 w-[280px] rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-3 shadow-[0_8px_24px_-12px_rgba(var(--rgb-shadow),0.35)]"
          >
          <div className="mb-2 flex items-center justify-between">
            <span className="kicker">Authorized Devices</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[11px] text-[var(--color-ink-3)] hover:text-[var(--color-ink-2)]"
            >
              Close
            </button>
          </div>
          {active.length === 0 ? (
            <p className="px-1 py-2 text-[12px] text-[var(--color-ink-3)]">No authorized devices.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {active.map(d => {
                const isThis = d.deviceId === deviceId
                return (
                  <li
                    key={d.tokenId}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--color-cream)]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] text-[var(--color-ink)]">
                        {d.label}
                        {isThis ? (
                          <span className="ml-1.5 text-[10.5px] text-[var(--color-ink-3)]">
                            (this device)
                          </span>
                        ) : null}
                      </span>
                      <span className="block font-mono text-[10.5px] text-[var(--color-ink-3)]">
                        {relFuture(d.expiresAt)} · {relPast(d.lastSeen)}
                      </span>
                    </span>
                    <button
                      type="button"
                      disabled={busy === d.tokenId}
                      onClick={async () => {
                        setBusy(d.tokenId)
                        try {
                          await onRevoke(d.tokenId)
                        } finally {
                          setBusy(null)
                        }
                      }}
                      className="shrink-0 rounded-full border border-[var(--color-border)] px-2.5 py-1 text-[11px] text-[var(--color-ink-2)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-ink)] disabled:opacity-50"
                    >
                      {busy === d.tokenId ? '…' : isThis ? 'Sign Out' : 'Revoke'}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
