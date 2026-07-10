/**
 * PROVENANCE — the "voyage" data shown in the OutputCanvas for each hero cycle.
 *
 * Each cycle maps to an ordered list of Receipt objects that animate
 * one-by-one in the right-hand canvas, tracing the journey of the
 * operation through the Anima / Zama stack.
 *
 * GlyphKind drives the animated SVG glyph in the right column.
 * Receipt.proofHref is optional — only set when a real on-chain artifact exists.
 *
 * NOTE: All tx hashes and on-chain references below are illustrative placeholders.
 * They demonstrate the intended UX narrative; they do not represent real Sepolia state.
 */

export type GlyphKind =
  | 'sign'
  | 'brain'
  | 'browser'
  | 'lock'
  | 'anchor'
  | 'swap'
  | 'stake'
  | 'message'
  | 'gavel'

export type Receipt = {
  id: string
  layer: string
  narration: string
  glyph: GlyphKind
  delayMs: number
  proofHref?: string
}

export type Provenance = {
  intro: string
  receipts: Receipt[]
  outcome: string
}

export const PROVENANCE: Record<string, Provenance> = {
  // ─── Cycle 1: shield payroll ──────────────────────────────────────────────
  research: {
    intro: 'Salary shielded as euint64 — nobody sees the amount',
    receipts: [
      {
        id: 'r1-wallet',
        layer: 'wallet',
        narration: 'Operator signed the FHE input proof with EIP-712. Amount encrypted client-side before leaving the browser.',
        glyph: 'sign',
        delayMs: 600,
      },
      {
        id: 'r1-encrypt',
        layer: 'zama fhe',
        narration: 'FHE.fromExternal() verified the ZKPoK — salary bound to msg.sender and AnimaPayroll. Now lives as a euint64 handle.',
        glyph: 'lock',
        delayMs: 2200,
      },
      {
        id: 'r1-contract',
        layer: 'anima payroll',
        narration: 'FHE.add() accumulated the new salary into the employee\'s encrypted balance. FHE.allowThis() + FHE.allow(employee) set.',
        glyph: 'brain',
        delayMs: 4000,
        proofHref: 'https://sepolia.etherscan.io/address/0x86ba59BdC7c6854610892B8a7B76294a94b8d1cB',
      },
      {
        id: 'r1-observer',
        layer: 'programmable compliance',
        narration: 'FHE.allow(balance, auditor) granted. Auditor can decrypt on legal demand. No other address can see the value.',
        glyph: 'anchor',
        delayMs: 6000,
      },
    ],
    outcome: 'Salary on-chain. Balance encrypted. Auditor has selective disclosure. Nobody else sees a number.',
  },

  // ─── Cycle 2: wrap + confidential transfer ────────────────────────────────
  swap: {
    intro: 'USDC wrapped to cUSDC — transfer amount stays private',
    receipts: [
      {
        id: 'r2-wallet',
        layer: 'wallet',
        narration: 'ERC-20 approved. Wrap amount encrypted client-side via @zama-fhe/react-sdk.',
        glyph: 'sign',
        delayMs: 500,
      },
      {
        id: 'r2-wrap',
        layer: 'registry router',
        narration: 'AnimaRegistryRouter forwarded wrap() to the official Zama ERC-7984 wrapper. USDC locked, cUSDC balance issued as euint64.',
        glyph: 'swap',
        delayMs: 2000,
        proofHref: 'https://sepolia.etherscan.io/address/0x447356d0825409428F1D90E65e067A3710599f83',
      },
      {
        id: 'r2-transfer',
        layer: 'confidential transfer',
        narration: 'FHE.sub(sender) then FHE.add(recipient) — no plaintext amount. The chain sees two address handles, no value.',
        glyph: 'lock',
        delayMs: 4000,
      },
      {
        id: 'r2-permit',
        layer: 'eip-712 decrypt',
        narration: 'FHE.allow(amount, recipient) set. Recipient can decrypt with one wallet signature. Only them, in their browser.',
        glyph: 'anchor',
        delayMs: 6000,
      },
    ],
    outcome: 'Transfer settled. Sender spent 500 cUSDC. Recipient received 500 cUSDC. Nobody else saw the amount.',
  },

  // ─── Cycle 3: confidential distribution ──────────────────────────────────
  commerce: {
    intro: '12 encrypted allocations created — amounts invisible on-chain',
    receipts: [
      {
        id: 'r3-encrypt',
        layer: 'tokenops sdk',
        narration: '12 allocations FHE-encrypted in-browser by @tokenops/sdk. One ZKPoK per recipient, bundled into one tx.',
        glyph: 'brain',
        delayMs: 600,
      },
      {
        id: 'r3-contract',
        layer: 'anima disperse',
        narration: 'createDistribution() stored 12 euint64 handles on-chain. recipientCount = 12 (public). All amounts = private.',
        glyph: 'lock',
        delayMs: 2400,
        proofHref: 'https://sepolia.etherscan.io/address/0xdF687b7fD99E9291CD0633F8c122A8ff8712Ab61',
      },
      {
        id: 'r3-vesting',
        layer: 'vesting schedule',
        narration: 'Cliff (30d) + linear (180d) encoded in VestingSchedule struct. Fraction computed on-chain via FHE.shr(FHE.mul()). Never revealed.',
        glyph: 'stake',
        delayMs: 4200,
      },
      {
        id: 'r3-claim',
        layer: 'recipient claim',
        narration: 'Recipient visits /disperse/[id], calls requestDecryptPermit(). One EIP-712 sign → only their allocation decrypts, in their browser.',
        glyph: 'sign',
        delayMs: 6400,
      },
    ],
    outcome: 'Distribution live. 12 encrypted allocations. Full recipient list and all amounts: invisible on-chain.',
  },

  // ─── Cycle 4: yield sub-account ──────────────────────────────────────────
  stake: {
    intro: 'Salary moved to internal yield sub-account — amount stays encrypted',
    receipts: [
      {
        id: 'r4-encrypt',
        layer: 'wallet',
        narration: 'Amount encrypted client-side. FHE input proof bound to earnYield() call and msg.sender.',
        glyph: 'sign',
        delayMs: 500,
      },
      {
        id: 'r4-guard',
        layer: 'fhe guard',
        narration: 'FHE.lte(amount, balance) — contract verified amount ≤ balance homomorphically. No plaintext ever decrypted.',
        glyph: 'brain',
        delayMs: 2000,
      },
      {
        id: 'r4-yield',
        layer: 'yield sub-account',
        narration: 'FHE.sub(main) + FHE.add(yield). Balance moved between encrypted sub-accounts on AnimaPayroll. Amount: always private.',
        glyph: 'stake',
        delayMs: 3800,
        proofHref: 'https://sepolia.etherscan.io/address/0x86ba59BdC7c6854610892B8a7B76294a94b8d1cB',
      },
      {
        id: 'r4-anchor',
        layer: 'sepolia',
        narration: 'Tx settled. euint64 handles updated. Public ledger shows a contract interaction. The value: sealed.',
        glyph: 'anchor',
        delayMs: 5600,
      },
    ],
    outcome: 'Yield position open. 3,000 cUSDC earning. Balance encrypted. DeFi with compliance.',
  },
}
