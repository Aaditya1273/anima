// Tests for verifyAndParseSiwe + nonce/domain logic. These exercise SIWE
// signature verification against a LOCAL viem test key (privateKeyToAccount):
// EOA verification is pure ecrecover, no chain. Only smart-wallet
// (EIP-1271/6492) verification would touch a chain client, which we avoid by
// using a plain EOA. Deterministic + CI-safe.

import { test, expect, mock, beforeAll } from 'bun:test'

// `server-only` is a Next.js build-time alias; stub it so the module imports.
mock.module('server-only', () => ({}))

// Anvil/Hardhat well-known test key #0 — never used for real funds.
const TEST_PK = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
const DOMAIN = 'localhost:3210'
const URI = 'http://localhost:3210'
const CHAIN_ID = 16661

type MessagesMod = typeof import('./messages')
type AccountsMod = typeof import('viem/accounts')

let messages: MessagesMod
let account: ReturnType<AccountsMod['privateKeyToAccount']>

beforeAll(async () => {
  messages = await import('./messages')
  const { privateKeyToAccount } = await import('viem/accounts')
  account = privateKeyToAccount(TEST_PK)
})

async function signed(nonce: string, opts: { domain?: string } = {}) {
  const domain = opts.domain ?? DOMAIN
  const msg = messages.buildSiweMessage({
    address: account.address,
    chainId: CHAIN_ID,
    nonce,
    domain,
    uri: URI,
  })
  const signature = await account.signMessage({ message: msg })
  return { msg, signature, domain }
}

test('valid EOA signature with matching nonce + domain passes', async () => {
  const nonce = messages.randomNonce()
  const { msg, signature } = await signed(nonce)
  const res = await messages.verifyAndParseSiwe(msg, signature, nonce, DOMAIN)
  expect(res.ok).toBe(true)
  if (res.ok) {
    expect(res.data.address.toLowerCase()).toBe(account.address.toLowerCase())
    expect(res.data.nonce).toBe(nonce)
    expect(res.data.domain).toBe(DOMAIN)
  }
})

test('wrong-nonce is rejected (CSRF / replay-prevention)', async () => {
  const nonce = messages.randomNonce()
  const { msg, signature } = await signed(nonce)
  const res = await messages.verifyAndParseSiwe(msg, signature, 'a'.repeat(32), DOMAIN)
  expect(res.ok).toBe(false)
  if (!res.ok) expect(res.reason).toBe('nonce mismatch')
})

test('wrong-domain is rejected (phishing / cross-site)', async () => {
  const nonce = messages.randomNonce()
  // Message itself is built for DOMAIN; server expects a different domain.
  const { msg, signature } = await signed(nonce)
  const res = await messages.verifyAndParseSiwe(msg, signature, nonce, 'evil.example.com')
  expect(res.ok).toBe(false)
  if (!res.ok) expect(res.reason).toContain('domain mismatch')
})

test('replay after nonce-rotation is rejected', async () => {
  // Client signs with nonce N1. Server rotated its expected nonce to N2 (e.g.
  // the nonce was consumed by a prior login). The same message+sig must fail.
  const n1 = messages.randomNonce()
  const n2 = messages.randomNonce()
  expect(n1).not.toBe(n2)
  const { msg, signature } = await signed(n1)
  // First-time success at N1.
  const first = await messages.verifyAndParseSiwe(msg, signature, n1, DOMAIN)
  expect(first.ok).toBe(true)
  // Replay against rotated nonce N2 fails before any signature work.
  const replay = await messages.verifyAndParseSiwe(msg, signature, n2, DOMAIN)
  expect(replay.ok).toBe(false)
  if (!replay.ok) expect(replay.reason).toBe('nonce mismatch')
})

test('missing nonce (server has empty expected nonce) is rejected', async () => {
  const nonce = messages.randomNonce()
  const { msg, signature } = await signed(nonce)
  // Server-side expectedNonce is empty/undefined -> never matches a real nonce.
  const res = await messages.verifyAndParseSiwe(msg, signature, '', DOMAIN)
  expect(res.ok).toBe(false)
  if (!res.ok) expect(res.reason).toBe('nonce mismatch')
})

test('tampered signature is rejected (signature invalid)', async () => {
  const nonce = messages.randomNonce()
  const { msg, signature } = await signed(nonce)
  // Flip the last byte of the signature. Nonce + domain still match, so this
  // exercises the actual ecrecover branch, not the early field checks.
  const last = signature.slice(-2)
  const flipped = `${signature.slice(0, -2)}${last === 'ff' ? '00' : 'ff'}` as `0x${string}`
  const res = await messages.verifyAndParseSiwe(msg, flipped, nonce, DOMAIN)
  expect(res.ok).toBe(false)
  if (!res.ok) {
    // Either viem flags it invalid, or recovery throws -> 'verify:' prefix.
    expect(res.reason === 'signature invalid' || res.reason.startsWith('verify:')).toBe(true)
  }
})

test('signature by a DIFFERENT key over the same message is rejected', async () => {
  const nonce = messages.randomNonce()
  const msg = messages.buildSiweMessage({
    address: account.address, // message claims account #0
    chainId: CHAIN_ID,
    nonce,
    domain: DOMAIN,
    uri: URI,
  })
  // But sign it with test key #1.
  const { privateKeyToAccount } = await import('viem/accounts')
  const other = privateKeyToAccount(
    '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
  )
  const signature = await other.signMessage({ message: msg })
  const res = await messages.verifyAndParseSiwe(msg, signature, nonce, DOMAIN)
  expect(res.ok).toBe(false)
})

test('malformed message body is rejected at parse', async () => {
  const res = await messages.verifyAndParseSiwe(
    'not a siwe message at all',
    '0xdeadbeef',
    'whatever',
    DOMAIN,
  )
  expect(res.ok).toBe(false)
  // Parse failure OR nonce-mismatch both acceptable; just must not be ok.
})

test('randomNonce produces 32 hex chars and is unique across calls', () => {
  const a = messages.randomNonce()
  const b = messages.randomNonce()
  expect(a).toMatch(/^[0-9a-f]{32}$/)
  expect(b).toMatch(/^[0-9a-f]{32}$/)
  expect(a).not.toBe(b)
})

test('buildSiweMessage embeds address, nonce, domain, chainId, uri verbatim', () => {
  const nonce = 'cafebabecafebabecafebabecafebabe'
  const msg = messages.buildSiweMessage({
    address: account.address,
    chainId: CHAIN_ID,
    nonce,
    domain: DOMAIN,
    uri: URI,
    issuedAt: '2026-06-14T00:00:00.000Z',
  })
  expect(msg).toContain(`${DOMAIN} wants you to sign in`)
  expect(msg).toContain(account.address)
  expect(msg).toContain(`Nonce: ${nonce}`)
  expect(msg).toContain(`Chain ID: ${CHAIN_ID}`)
  expect(msg).toContain(`URI: ${URI}`)
  expect(msg).toContain('Issued At: 2026-06-14T00:00:00.000Z')
})
