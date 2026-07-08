// Browser gateway client — the in-browser counterpart of
// packages/cli/src/sandbox/client.ts, pointed at the relay instead of a direct
// daemon endpoint. It signs chat/approval messages with the connected operator
// wallet (a `signRaw` closure wrapping wagmi `signMessageAsync({message:{raw}})`)
// so the daemon's EIP-191 verification passes; the relay only pipes bytes.

import type { Address, Hex } from 'viem'
import {
  type ApprovalDecision,
  approvalResponseHash,
  chatMessageHash,
  sessionGrantMessage,
  syncRequestHash,
  webSessionRevokeMessage,
} from './hash'

export interface ChatResponse {
  response: string
  toolCalls: Array<{ name: string; ok: boolean; durationMs: number }>
  durationMs: number
  syncTx?: string
}

export interface HealthzResponse {
  state: string
  sandboxId: string
  version: string
  runtimeReady: boolean
  agentAddress: string | null
  listeners?: Record<string, 'active' | 'disabled' | 'failed'>
  permsMode?: 'off' | 'prompt' | 'strict'
  // v0.27: 'trusted' = no write signature needed (trustLocal daemon); 'signed' =
  // writes need a device token or a per-message sig. Absent on pre-v0.27 daemons
  // → treated as 'signed' (safe: client signs, an old trustLocal daemon ignores).
  writeAuth?: 'trusted' | 'signed'
}

/** One authorized web device (write token) — never carries the secret. */
export interface DeviceListing {
  tokenId: string
  deviceId: string
  label: string
  scope: string
  issuedAt: number
  expiresAt: number
  lastSeen: number
  revoked: boolean
  expired: boolean
}

export interface GrantResult {
  tokenId: string
  token: string
  expiresAt: number
}

export interface ParsedSseEvent {
  seq: number
  kind: string
  ts: number
  data: unknown
}

export type SignRaw = (hash: Hex) => Promise<Hex>
export type SignText = (message: string) => Promise<Hex>

export interface RelayClientOpts {
  /** Relay public HTTP base, e.g. https://relay.anima.0g */
  relayUrl: string
  /** Secret routing slug the agent registered under. */
  agentId: string
  /** Sign the raw 32-byte digest with the operator wallet (chat / approval / sync). */
  signRaw: SignRaw
  /**
   * Sign a human-readable TEXT message with the operator wallet (device grant /
   * revoke). Separate from signRaw because some wallets (e.g. kura) special-case
   * a 32-byte raw personal_sign with a non-EOA signer; a text message recovers
   * to the real account. Falls back to signRaw-style if not provided.
   */
  signText?: SignText
  /**
   * v0.26 SSE read-auth bearer token, minted server-side by the connection
   * route for the verified owner. Sent on the read routes (/events, /sessions,
   * /history). Optional — when the daemon has no readSecret configured the read
   * routes are slug-gated only and this is ignored.
   */
  readToken?: string
  /**
   * v0.27 operator (iNFT owner) address — needed to build the device grant
   * digest (sessionGrantHash binds the operator). The daemon independently
   * recovers the signer and checks it equals its own operator, so this is only
   * the value the browser puts INTO the signed hash, never a trust input.
   */
  operator?: Address
  /** v0.27 device write token (`anima-dev:<id>.<secret>`), if already granted. */
  deviceToken?: string
}

/** One web conversation session (a `web:<id>` brain history partition). */
export interface SessionMeta {
  id: string
  title: string
  messageCount: number
  updatedAt?: number
}

/** A rehydrated transcript turn for resuming a session across reloads. */
export interface SessionTurn {
  role: 'user' | 'assistant'
  content: string
}

export class RelayGatewayClient {
  #base: string
  #signRaw: SignRaw
  #signText: SignText
  #sandboxId: string | null = null
  #writeAuth: 'trusted' | 'signed' | null = null
  #readToken?: string
  #operator?: Address
  #deviceToken?: string

  constructor(opts: RelayClientOpts) {
    this.#base = `${opts.relayUrl.replace(/\/$/, '')}/a/${opts.agentId}`
    this.#signRaw = opts.signRaw
    // Fallback keeps older callers working; the console always supplies signText.
    this.#signText = opts.signText ?? ((m: string) => opts.signRaw(m as unknown as Hex))
    this.#readToken = opts.readToken
    this.#operator = opts.operator
    this.#deviceToken = opts.deviceToken
  }

  /**
   * Set (or clear) the device write token in place — no new client. The console
   * grants once, persists the token, and pushes it here so subsequent chats ride
   * the bearer instead of prompting a per-message signature.
   */
  setDeviceToken(token: string | undefined): void {
    this.#deviceToken = token
  }

  /** Whether a device token is currently held. */
  hasDeviceToken(): boolean {
    return !!this.#deviceToken
  }

  /** Bearer header for read routes when a readToken is configured. */
  #readAuth(): Record<string, string> {
    return this.#readToken ? { authorization: `Bearer ${this.#readToken}` } : {}
  }

  /**
   * Refresh the read-auth token in place (no new client). The SSE read token is
   * bucketed (~1h validity) and only checked at (re)connect time, so the console
   * re-mints it periodically and pushes it here; the next /events reconnect or
   * /sessions poll then carries the fresh token. Updating in place avoids
   * rebuilding the client (which would reset the live stream + transcript).
   */
  setReadToken(token: string | undefined): void {
    this.#readToken = token
  }

  async health(): Promise<HealthzResponse> {
    const r = await fetch(`${this.#base}/healthz`)
    if (!r.ok) throw new Error(`healthz ${r.status}`)
    const h = (await r.json()) as HealthzResponse
    this.#sandboxId = h.sandboxId
    // Absent on older daemons → 'signed' (safe default; a trustLocal daemon
    // simply ignores the sig the client then sends).
    this.#writeAuth = h.writeAuth === 'trusted' ? 'trusted' : 'signed'
    return h
  }

  /** Cached sandboxId (fetched from /healthz) needed to anchor signatures. */
  async sandboxId(): Promise<string> {
    if (this.#sandboxId) return this.#sandboxId
    const h = await this.health()
    return h.sandboxId
  }

  /**
   * Cached write-auth mode. 'trusted' → writes need no signature at all (a local
   * unix-socket daemon); 'signed' → writes need a device token or a per-message
   * EIP-191 sig. Fetched once via /healthz.
   */
  async writeAuthMode(): Promise<'trusted' | 'signed'> {
    if (this.#writeAuth) return this.#writeAuth
    await this.health()
    return this.#writeAuth ?? 'signed'
  }

  async chat(
    message: string,
    opts: { signal?: AbortSignal; sessionId?: string } = {},
  ): Promise<ChatResponse> {
    const ts = Date.now()
    const headers: Record<string, string> = { 'content-type': 'application/json' }
    const body: Record<string, unknown> = { message, ts }
    // sessionId is ROUTING-ONLY: it never enters chatMessageHash (preserves
    // EIP-191 parity + the TUI), only the request body.
    if (opts.sessionId) body.sessionId = opts.sessionId

    const mode = await this.writeAuthMode()
    if (mode === 'signed') {
      if (this.#deviceToken) {
        // One prior grant → ride the opaque bearer, no per-message popup.
        headers.authorization = `Bearer ${this.#deviceToken}`
      } else {
        // Fallback: per-message EIP-191 sig (the pre-v0.27 path, byte-identical).
        const sandboxId = await this.sandboxId()
        body.signature = await this.#signRaw(chatMessageHash(message, ts, sandboxId))
      }
    }
    // mode === 'trusted' → the daemon trusts the connection; send no auth.

    const r = await fetch(`${this.#base}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: opts.signal,
    })
    if (!r.ok) {
      const detail = await r.text().catch(() => '')
      throw new Error(`chat ${r.status}: ${detail.slice(0, 200)}`)
    }
    return (await r.json()) as ChatResponse
  }

  /**
   * v0.27: grant THIS device a long-lived write token with ONE wallet signature.
   * The operator signs sessionGrantHash; the daemon verifies the signer is the
   * iNFT owner and mints an opaque bearer (returned once). `expiresAt` is a unix
   * ms timestamp, or 0 for never-expire. After this, chat() rides the token.
   */
  async grantDevice(opts: {
    deviceId: string
    label: string
    expiresAt: number
    scope?: string
    signal?: AbortSignal
  }): Promise<GrantResult> {
    if (!this.#operator) throw new Error('operator address required to grant a device')
    const scope = opts.scope ?? 'write'
    const sandboxId = await this.sandboxId()
    const issuedAt = Date.now()
    const signature = await this.#signText(
      sessionGrantMessage({
        deviceId: opts.deviceId,
        scope,
        operator: this.#operator,
        sandboxId,
        issuedAt,
        expiresAt: opts.expiresAt,
      }),
    )
    const r = await fetch(`${this.#base}/web-session/grant`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        deviceId: opts.deviceId,
        label: opts.label,
        scope,
        issuedAt,
        expiresAt: opts.expiresAt,
        signature,
      }),
      signal: opts.signal,
    })
    if (!r.ok) {
      const detail = await r.text().catch(() => '')
      throw new Error(`grant ${r.status}: ${detail.slice(0, 200)}`)
    }
    const result = (await r.json()) as GrantResult
    this.#deviceToken = result.token
    return result
  }

  /** List the operator's authorized devices (read route, readToken-gated). */
  async listDevices(opts: { signal?: AbortSignal } = {}): Promise<DeviceListing[]> {
    const r = await fetch(`${this.#base}/web-sessions`, {
      headers: { ...this.#readAuth() },
      signal: opts.signal,
    })
    if (!r.ok) throw new Error(`web-sessions ${r.status}`)
    const body = (await r.json()) as { devices?: DeviceListing[] }
    return body.devices ?? []
  }

  /**
   * Revoke a device token. Operator-signed (the revoke digest binds the
   * tokenId). If the revoked device is THIS client's, also clears its token.
   */
  async revokeDevice(tokenId: string, opts: { signal?: AbortSignal } = {}): Promise<void> {
    const sandboxId = await this.sandboxId()
    const ts = Date.now()
    const signature = await this.#signText(webSessionRevokeMessage({ tokenId, sandboxId, ts }))
    const r = await fetch(`${this.#base}/web-session/revoke`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tokenId, ts, signature }),
      signal: opts.signal,
    })
    if (!r.ok) {
      const detail = await r.text().catch(() => '')
      throw new Error(`revoke ${r.status}: ${detail.slice(0, 200)}`)
    }
  }

  /** List the agent's web conversation sessions (read route, readToken-gated). */
  async listSessions(opts: { signal?: AbortSignal } = {}): Promise<SessionMeta[]> {
    const r = await fetch(`${this.#base}/sessions`, {
      headers: { ...this.#readAuth() },
      signal: opts.signal,
    })
    if (!r.ok) throw new Error(`sessions ${r.status}`)
    const body = (await r.json()) as { sessions?: SessionMeta[] }
    return body.sessions ?? []
  }

  /** Rehydrate one session's transcript (read route, readToken-gated). */
  async getHistory(
    sessionId: string,
    opts: { signal?: AbortSignal } = {},
  ): Promise<SessionTurn[]> {
    const r = await fetch(`${this.#base}/history?sessionId=${encodeURIComponent(sessionId)}`, {
      headers: { ...this.#readAuth() },
      signal: opts.signal,
    })
    if (!r.ok) throw new Error(`history ${r.status}`)
    const body = (await r.json()) as { messages?: SessionTurn[] }
    return body.messages ?? []
  }

  /**
   * Trigger an on-chain memory sync (anchors activity + memory to 0G Storage).
   * Operator-signed: /sync forces paid chain writes, so the daemon requires an
   * EIP-191 sig over syncRequestHash (same shape as the admin-tick digest).
   */
  async sync(): Promise<{ tx?: string; slots?: string[] }> {
    const sandboxId = await this.sandboxId()
    const ts = Date.now()
    const signature = await this.#signRaw(syncRequestHash(ts, sandboxId))
    const r = await fetch(`${this.#base}/sync`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ts, signature }),
    })
    if (!r.ok) {
      const detail = await r.text().catch(() => '')
      throw new Error(`sync ${r.status}: ${detail.slice(0, 200)}`)
    }
    return (await r.json()) as { tx?: string; slots?: string[] }
  }

  /** allow-once collapses to wire 'allow' (the daemon's ApprovalRelay vocab). */
  async approve(approvalId: string, decision: 'allow' | 'allow-session' | 'deny'): Promise<void> {
    const sandboxId = await this.sandboxId()
    const ts = Date.now()
    const wire: ApprovalDecision = decision
    const signature = await this.#signRaw(
      approvalResponseHash({ approvalId, decision: wire, ts, sandboxId }),
    )
    const r = await fetch(`${this.#base}/approval/${approvalId}/respond`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ decision: wire, ts, signature }),
    })
    if (!r.ok && r.status !== 409) {
      const detail = await r.text().catch(() => '')
      throw new Error(`approve ${r.status}: ${detail.slice(0, 200)}`)
    }
  }

  /**
   * Subscribe to the daemon /events SSE through the relay. `client=tui` makes
   * this the live operator surface (suppresses duplicate Telegram clarify
   * forwarding while connected). Reconnects with last-event-id on drop.
   */
  async *events(
    opts: { signal?: AbortSignal; sinceSeq?: number } = {},
  ): AsyncGenerator<ParsedSseEvent> {
    let lastSeq = opts.sinceSeq
    const signal = opts.signal
    while (true) {
      if (signal?.aborted) return
      const headers: Record<string, string> = { accept: 'text/event-stream', ...this.#readAuth() }
      if (typeof lastSeq === 'number') headers['last-event-id'] = String(lastSeq)
      let res: Response
      try {
        res = await fetch(`${this.#base}/events?client=tui`, { headers, signal })
      } catch {
        if (signal?.aborted) return
        await new Promise(r => setTimeout(r, 1000))
        continue
      }
      if (!res.ok || !res.body) {
        await new Promise(r => setTimeout(r, 1000))
        continue
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      try {
        while (true) {
          if (signal?.aborted) return
          const { value, done } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })
          for (;;) {
            const sep = buf.indexOf('\n\n')
            if (sep === -1) break
            const chunk = buf.slice(0, sep)
            buf = buf.slice(sep + 2)
            const ev = parseSseChunk(chunk)
            if (!ev) continue
            lastSeq = ev.seq
            yield ev
          }
        }
      } catch {
        /* reconnect */
      }
      if (signal?.aborted) return
      await new Promise(r => setTimeout(r, 500))
    }
  }
}

export function parseSseChunk(chunk: string): ParsedSseEvent | null {
  let id: number | null = null
  let kind: string | null = null
  let dataLine = ''
  for (const rawLine of chunk.split('\n')) {
    const line = rawLine.trimEnd()
    if (!line || line.startsWith(':')) continue
    if (line.startsWith('id: ')) {
      const n = Number.parseInt(line.slice(4), 10)
      if (Number.isFinite(n)) id = n
    } else if (line.startsWith('event: ')) {
      kind = line.slice(7)
    } else if (line.startsWith('data: ')) {
      dataLine = dataLine ? `${dataLine}\n${line.slice(6)}` : line.slice(6)
    }
  }
  if (id == null || !kind || !dataLine) return null
  try {
    const parsed = JSON.parse(dataLine) as { ts: number; data: unknown }
    return { seq: id, kind, ts: parsed.ts, data: parsed.data }
  } catch {
    return null
  }
}
