/**
 * One-off fixture generator (NOT a test). Produces FROZEN backward-compat
 * fixtures under test/fixtures/compat/ using the CURRENT encoders. Run once
 * per new on-disk/on-chain format version:
 *
 *   bun test/fixtures/compat/__generate.ts
 *
 * The OUTPUT bytes are committed and must keep decoding with future code.
 * Do NOT re-run this to "refresh" an existing fixture — that would defeat the
 * freeze. A new format version adds a NEW fixture file with a new generator
 * block here, never overwrites an old one.
 *
 * Determinism note: the keystore/operator-blob encoders inject a random AES-GCM
 * IV, so the produced bytes are not reproducible run-to-run. That is fine: we
 * freeze the captured output. Decryption only needs the SAME operator + agent
 * keys (RFC-6979 deterministic ECDSA → deterministic HKDF key), which are the
 * fixed throwaway constants below.
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { privateKeyToAccount } from 'viem/accounts'
import { encodePackBlob } from '../../../packages/core/src/memory/pack-blob'
import { RawPrivkeyOperatorSigner } from '../../../packages/core/src/operator/raw-privkey'
import { encryptKey } from '../../../packages/core/src/wallet/keystore'
import {
  OPERATOR_BLOB_SCOPES,
  encodeKeystoreBytes,
  encodeOperatorBlobBytes,
  encryptAgentKey,
  encryptOperatorBlob,
} from '../../../packages/core/src/wallet/operator-keystore-crypto'

// === FROZEN throwaway test constants (NOT real operator material) ===
// These appear verbatim in the *.test.ts files so the decoder can re-derive
// the same AES key. Never replace with a real key.
export const TEST_OPERATOR_PRIVKEY =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d' as const
export const TEST_AGENT_PRIVKEY =
  '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba' as const
export const TEST_V1_PASSPHRASE = 'frozen-compat-v1-passphrase' as const

const dir = import.meta.dir

function write(name: string, bytes: Uint8Array) {
  const p = join(dir, name)
  writeFileSync(p, bytes)
  console.log(`wrote ${name} (${bytes.length} bytes)`)
}

async function main() {
  const signer = new RawPrivkeyOperatorSigner({ privkey: TEST_OPERATOR_PRIVKEY })
  const agentAddress = privateKeyToAccount(TEST_AGENT_PRIVKEY).address

  // 1. Operator keystore v2 (sign-derived key). On-disk JSON bytes.
  const ksV2 = await encryptAgentKey({ signer, agentAddress, agentPrivkey: TEST_AGENT_PRIVKEY })
  write('operator-keystore-v2.json', encodeKeystoreBytes(ksV2))

  // 2. Operator scoped blob v2 (TELEGRAM scope). On-disk JSON bytes.
  const tgPlaintext = new TextEncoder().encode(
    JSON.stringify({ telegram: { botToken: '123456:FROZEN-TEST-TOKEN', allowedUserIds: [42] } }),
  )
  const blobV2 = await encryptOperatorBlob({
    signer,
    scope: OPERATOR_BLOB_SCOPES.TELEGRAM,
    agentAddress,
    plaintext: tgPlaintext,
  })
  write('operator-blob-telegram-v2.json', encodeOperatorBlobBytes(blobV2))

  // 3. Legacy v1 passphrase keystore. On-disk JSON bytes.
  const agentPrivBytes = new Uint8Array(Buffer.from(TEST_AGENT_PRIVKEY.slice(2), 'hex'))
  const ksV1 = encryptKey(agentPrivBytes, TEST_V1_PASSPHRASE)
  write('keystore-v1.json', new TextEncoder().encode(JSON.stringify(ksV1)))

  // 4. Pack-blob v2 envelope (memory partition). Raw UTF-8 envelope bytes.
  const packV2 = encodePackBlob({
    root: '# MEMORY.md\n\n- [identity](./agent/identity.md) frozen compat index\n',
    files: {
      'learned-frozen.md': '# Learned\n\nThe pack-blob v2 envelope is frozen for compat.\n',
      'operator-preferences.md': '# Operator Preferences\n\ndark mode, bun runtime\n',
    },
  })
  write('pack-blob-v2.json', packV2)

  // 5. Legacy v1 pack blob = raw markdown (pre-v0.24.0 single-file layout).
  // Frozen to guard the v1 fallthrough path (isV2Envelope must stay false).
  const packV1 = new TextEncoder().encode('# MEMORY.md\n\nlegacy single-file markdown body\n')
  write('pack-blob-v1-legacy.md', packV1)

  console.log('done')
}

main()
