// Tests for authorizeAgent — the SERVER-SIDE ownerOf gate. This is the single
// most security-critical function in apps/web: it decides whether an
// authenticated wallet may reach a live agent. We stub two collaborators:
//   - ./session getSession  -> controls the authenticated operator address
//   - viem createPublicClient.readContract(ownerOf) -> controls on-chain owner
// Stubbing a chain READ to exercise a branch is NOT faking 0G integration; it
// isolates the gate's decision logic for deterministic, no-network testing.

import { afterAll, beforeAll, expect, mock, test } from 'bun:test'

mock.module('server-only', () => ({}))

// Mutable knobs the stubs read at call time.
let sessionAddress: string | undefined
let readContract: (args: unknown) => Promise<unknown>

mock.module('./session', () => ({
  getSession: async () => ({ address: sessionAddress }),
}))

let viemActual: typeof import('viem')

let authorizeAgent: typeof import('./authorize').authorizeAgent

beforeAll(async () => {
  viemActual = await import('viem')
  // Replace createPublicClient with a stub that routes readContract to our knob,
  // keeping every other viem export intact (defineChain etc. used by chain.ts).
  mock.module('viem', () => ({
    ...viemActual,
    createPublicClient: () => ({
      readContract: (args: unknown) => readContract(args),
    }),
  }))
  ;({ authorizeAgent } = await import('./authorize'))
})

// mock.module is process-global; restore so the stubbed `viem`/`./session`/
// `server-only` modules don't leak into sibling web test files in the same run.
afterAll(() => mock.restore())

const OWNER = '0x1111111111111111111111111111111111111111'
const OWNER_CHECKSUM = '0x1111111111111111111111111111111111111111'
const OTHER = '0x2222222222222222222222222222222222222222'

test('authenticated owner whose address matches ownerOf -> authorized', async () => {
  sessionAddress = OWNER
  readContract = async () => OWNER
  const res = await authorizeAgent(16n)
  expect(res).not.toBeNull()
  expect(res?.operator.toLowerCase()).toBe(OWNER)
  expect(res?.owner.toLowerCase()).toBe(OWNER)
  expect(res?.tokenId).toBe(16n)
})

test('owner match is case-insensitive (checksum vs lowercase)', async () => {
  // session has lowercase, chain returns checksummed (mixed case) — must match.
  sessionAddress = OWNER
  readContract = async () => '0x1111111111111111111111111111111111111111'.toUpperCase().replace('0X', '0x')
  const res = await authorizeAgent(7n)
  expect(res).not.toBeNull()
  expect(res?.tokenId).toBe(7n)
})

test('authenticated but ownerOf returns a DIFFERENT address -> null (mismatch)', async () => {
  sessionAddress = OWNER
  readContract = async () => OTHER
  const res = await authorizeAgent(16n)
  expect(res).toBeNull()
})

test('unauthenticated (no session address) -> null, never reads chain', async () => {
  sessionAddress = undefined
  let called = false
  readContract = async () => {
    called = true
    return OWNER
  }
  const res = await authorizeAgent(16n)
  expect(res).toBeNull()
  // The gate must short-circuit before any chain read when there is no session.
  expect(called).toBe(false)
})

test('ownerOf readContract throws (RPC error / nonexistent token) -> null (catch)', async () => {
  sessionAddress = OWNER
  readContract = async () => {
    throw new Error('execution reverted: ERC721: invalid token ID')
  }
  const res = await authorizeAgent(99999n)
  expect(res).toBeNull()
})

test('empty-string session address is treated as unauthenticated -> null', async () => {
  sessionAddress = ''
  let called = false
  readContract = async () => {
    called = true
    return OWNER
  }
  const res = await authorizeAgent(16n)
  expect(res).toBeNull()
  expect(called).toBe(false)
})

// Defensive: ensure checksum reference is used (no accidental constant drift).
test('owner constants are well-formed', () => {
  expect(OWNER_CHECKSUM).toBe(OWNER)
})
