// Browser-side copies of the gateway's EIP-191 signing digests. These MUST stay
// byte-identical to packages/gateway/src/auth.ts (chatMessageHash /
// approvalResponseHash) — the daemon recovers the operator address from a
// personal_sign over the raw 32-byte hash and a mismatch yields a silent 401
// 'sig-mismatch'. Same field order, same uint64-via-BigInt ts, strict
// encodeAbiParameters (NOT encodePacked), keccak256.

import { type Address, type Hex, encodeAbiParameters, getAddress, keccak256 } from 'viem'

export function chatMessageHash(message: string, ts: number, sandboxId: string): Hex {
  return keccak256(
    encodeAbiParameters(
      [
        { type: 'string', name: 'message' },
        { type: 'uint64', name: 'ts' },
        { type: 'string', name: 'sandboxId' },
      ],
      [message, BigInt(ts), sandboxId],
    ),
  )
}

// Mirrors the gateway's adminTickHash({ action: 'sync', ts, sandboxId }) — the
// daemon verifies /sync over the web tunnel with verifyAdminTickSig(action:'sync').
export function syncRequestHash(ts: number, sandboxId: string): Hex {
  return keccak256(
    encodeAbiParameters(
      [
        { type: 'string', name: 'action' },
        { type: 'uint64', name: 'ts' },
        { type: 'string', name: 'sandboxId' },
      ],
      ['sync', BigInt(ts), sandboxId],
    ),
  )
}

// v0.27 device-session grant + revoke. These are HUMAN-READABLE TEXT messages
// (personal_sign over a string), NOT 32-byte raw-hash digests, and MUST stay
// byte-identical to the gateway's sessionGrantMessage / webSessionRevokeMessage
// (auth.ts). Text (not raw hash) because some smart/abstracted wallets (e.g.
// kura) special-case a 32-byte personal_sign and sign it with a non-EOA key,
// which then fails plain EOA recovery; a text message signs with the real
// account key and recovers correctly (and is friendlier in the wallet prompt).
export function sessionGrantMessage(opts: {
  deviceId: string
  scope: string
  operator: Address
  sandboxId: string
  issuedAt: number
  expiresAt: number
}): string {
  const expires = opts.expiresAt === 0 ? 'never' : String(opts.expiresAt)
  return [
    'anima: authorize web device',
    '',
    `agent: ${opts.sandboxId}`,
    `operator: ${getAddress(opts.operator)}`,
    `device: ${opts.deviceId}`,
    `scope: ${opts.scope}`,
    `issued: ${opts.issuedAt}`,
    `expires: ${expires}`,
  ].join('\n')
}

export function webSessionRevokeMessage(opts: {
  tokenId: string
  sandboxId: string
  ts: number
}): string {
  return [
    'anima: revoke web device',
    '',
    `agent: ${opts.sandboxId}`,
    `token: ${opts.tokenId}`,
    `issued: ${opts.ts}`,
  ].join('\n')
}

export type ApprovalDecision = 'allow' | 'allow-session' | 'deny'

export function approvalResponseHash(opts: {
  approvalId: string
  decision: ApprovalDecision
  ts: number
  sandboxId: string
}): Hex {
  return keccak256(
    encodeAbiParameters(
      [
        { type: 'string', name: 'approvalId' },
        { type: 'string', name: 'decision' },
        { type: 'uint64', name: 'ts' },
        { type: 'string', name: 'sandboxId' },
      ],
      [opts.approvalId, opts.decision, BigInt(opts.ts), opts.sandboxId],
    ),
  )
}
