import { describe, expect, test } from 'bun:test'
import { mintReadToken, readTokenFor } from './read-token'

// Cross-package parity: these vectors MUST equal the gateway's pinned vectors
// (packages/gateway/src/auth.test.ts → readTokenFor('vector-secret', 5)). If the
// apps/web mint drifts from the daemon's verifier, SSE read-auth silently 401s;
// pinning the same known-answer vector on both sides catches that drift.
describe('read-token parity with the gateway', () => {
  test('readTokenFor matches the pinned cross-package vector', () => {
    expect(readTokenFor('vector-secret', 5)).toBe(
      '702385dcb647c5f7c092ad445618b7f50265520511b3f37d2d376cf9110770af',
    )
  })

  test('mintReadToken uses the 1h bucket at the given time', () => {
    const now = 5 * 60 * 60 * 1000 + 999 // bucket 5
    expect(mintReadToken('vector-secret', now)).toBe(readTokenFor('vector-secret', 5))
  })
})
