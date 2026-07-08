import { describe, expect, test } from 'bun:test'
import { sessionGrantMessage, webSessionRevokeMessage } from './hash'

// Cross-package parity: these vectors MUST equal the gateway's pinned vectors
// (packages/gateway/src/auth.test.ts → sessionGrantMessage). If the browser copy
// drifts from the daemon's verifier, the grant silently 401s 'sig-mismatch';
// pinning the same known-answer vector on both sides catches that drift.
describe('sessionGrantMessage parity with the gateway', () => {
  test('matches the pinned cross-package vector', () => {
    expect(
      sessionGrantMessage({
        deviceId: 'vector-device',
        scope: 'write',
        operator: '0x1111111111111111111111111111111111111111',
        sandboxId: 'vector-sandbox',
        issuedAt: 5,
        expiresAt: 0,
      }),
    ).toBe(
      'anima: authorize web device\n\nagent: vector-sandbox\noperator: 0x1111111111111111111111111111111111111111\ndevice: vector-device\nscope: write\nissued: 5\nexpires: never',
    )
  })

  test('every field is load-bearing', () => {
    const base = {
      deviceId: 'd',
      scope: 'write',
      operator: '0x1111111111111111111111111111111111111111' as const,
      sandboxId: 's',
      issuedAt: 1,
      expiresAt: 0,
    }
    const m = sessionGrantMessage(base)
    expect(sessionGrantMessage({ ...base, deviceId: 'd2' })).not.toBe(m)
    expect(sessionGrantMessage({ ...base, scope: 'write+spend' })).not.toBe(m)
    expect(sessionGrantMessage({ ...base, sandboxId: 's2' })).not.toBe(m)
    expect(sessionGrantMessage({ ...base, issuedAt: 2 })).not.toBe(m)
    expect(sessionGrantMessage({ ...base, expiresAt: 1 })).not.toBe(m)
  })

  test('webSessionRevokeMessage binds the tokenId', () => {
    const a = webSessionRevokeMessage({ tokenId: 'tok-A', sandboxId: 'sbx', ts: 100 })
    const b = webSessionRevokeMessage({ tokenId: 'tok-B', sandboxId: 'sbx', ts: 100 })
    expect(a).not.toBe(b)
  })
})
