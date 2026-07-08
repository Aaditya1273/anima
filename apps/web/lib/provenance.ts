/**
 * Provenance ledger entries — what actually happened in the substrate
 * (wallet, FHEVM, payroll vault, chain) for each cycle. The right-side hero
 * canvas renders these as commentary on the left-side chat.
 *
 * The narration is the headline: a plain-English sentence a non-crypto
 * reader can grasp in 2 seconds. The proof link points to the real
 * Etherscan page for the deployed contract that actually executed the
 * action.
 */

export type StampKind =
  | 'wallet'
  | 'attestation'
  | 'sandbox'
  | 'storage'
  | 'chain'
  | 'inbox'
  | 'market'

/**
 * Tool-specific animated glyph kind. Each one renders a small SVG icon
 * inside the station node — the icon ANIMATES on station activation
 * (the line draws itself, the lock shackle closes, etc.) so the moment
 * of the substrate firing is visible.
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
  /** Tool-specific animated glyph for the station node. */
  glyph: GlyphKind
  /** Legacy big-stamp kind, kept for cycles that haven't been migrated. */
  stamp?: StampKind
  /** Title-cased display label rendered in the right-side panel. */
  layer: 'You' | 'Brain' | 'Limbs' | 'Memory' | 'Chain' | 'Comms' | 'Commerce'
  /** Plain-English sentence that EXPLAINS what just happened. */
  narration: string
  /** Optional explorer link — when set, renders a "verify on chain ↗" link below the narration. */
  proofHref?: string
  delayMs: number
}

export type Provenance = {
  /** One-line frame for the whole right panel for this cycle. */
  intro: string
  outcome: string
  receipts: Receipt[]
}

// Real Ethereum Sepolia contract addresses. Each `proofHref` points at
// the Etherscan /address/ page for the contract that actually executes
// the station's action — clicking it shows real on-chain activity.
const ETHERSCAN_ADDR = 'https://sepolia.etherscan.io/address/'
const ANIMA_PAYROLL = '0x86ba59BdC7c6854610892B8a7B76294a94b8d1cB'
const ANIMA_REGISTRY = '0x447356d0825409428F1D90E65e067A3710599f83'
const ANIMA_DISPERSE = '0xdF687b7fD99E9291CD0633F8c122A8ff8712Ab61'

const INTRO = 'every step is proven on Ethereum Sepolia'

// ─── per-cycle provenance ──────────────────────────────────────────────
//
// All cycles follow a 5-station voyage synced to the left-side chat:
//   1. You      — wallet signs the intent (EIP-712 typed data)
//   2. Brain    — FHEVM co-processor validates + processes the encrypted input
//   3. [action] — the cycle's headline beat (shield / transfer / distribute / earn-yield)
//   4. Memory   — receipt logged on-chain via the relevant contract
//   5. Chain    — transaction confirmed on Ethereum Sepolia
//
// `delayMs` for each station is hand-tuned to fire just after the matching
// left-side moment lands. See TuiCanvas.tsx + TgCanvas.tsx for the left-side
// timing constants.

export const PROVENANCE: Record<string, Provenance> = {
  // ─── Cycle 1 , TUI · shield payroll ───────────────────────────────────
  // TuiCanvas: commit at 2800, tools start at 2800 stagger 700ms each, last
  // tool (memory.save, idx 5) at 6300, reply at 7600.
  research: {
    intro: INTRO,
    outcome: 'Salary saved to /vault/payroll/2026-07-08',
    receipts: [
      {
        id: 'r-sign',
        glyph: 'sign',
        stamp: 'wallet',
        layer: 'You',
        narration: 'Your wallet signed the shield intent before the amount left your browser.',
        delayMs: 2700, // just after `you · …` row commits
      },
      {
        id: 'r-attest',
        glyph: 'brain',
        stamp: 'attestation',
        layer: 'Brain',
        narration:
          'The FHEVM co-processor verified the ZKPoK and converted the ciphertext to a euint64 handle. No plaintext was ever decrypted on-chain.',
        delayMs: 3100, // as "thinking…" appears
      },
      {
        id: 'r-sandbox',
        glyph: 'lock',
        stamp: 'sandbox',
        layer: 'Chain',
        narration:
          'AnimaPayroll.paySalary() executed against the payroll vault — encrypted balance updated via FHE.add() in the Zama FHEVM.',
        proofHref: ETHERSCAN_ADDR + ANIMA_PAYROLL,
        delayMs: 3500, // first tool block visible
      },
      {
        id: 'r-storage',
        glyph: 'browser',
        stamp: 'storage',
        layer: 'Memory',
        narration:
          'The CFO can later grant an auditor FHE.allow() on specific balances — decryptable on demand, invisible by default.',
        delayMs: 6700, // memory.save tool block lands
      },
      {
        id: 'r-chain',
        glyph: 'anchor',
        stamp: 'chain',
        layer: 'Chain',
        narration:
          'The entire transaction is settled on Ethereum Sepolia. Anyone can verify the payroll vault code on Etherscan.',
        proofHref: ETHERSCAN_ADDR + ANIMA_PAYROLL,
        delayMs: 9000, // ~1.4s after reply lands
      },
    ],
  },

  // ─── Cycle 2 , TG · wrap + confidential transfer ──────────────────────
  // TgCanvas: greeting 200/800/1500, main user at 2400, think at 3000,
  // tools at 3800 stagger 380ms each. fhe.transfer (idx 4) at 5320.
  // memory.save (idx 5) at 5700. Reply at ~6700.
  swap: {
    intro: INTRO,
    outcome: '500 cUSDC transferred confidentially · receipt saved to /transfers',
    receipts: [
      {
        id: 's-sign',
        glyph: 'sign',
        stamp: 'wallet',
        layer: 'You',
        narration: 'Your wallet signed the wrap intent and the transfer intent — one EIP-712 approval each.',
        delayMs: 2500, // main user prompt commits
      },
      {
        id: 's-attest',
        glyph: 'brain',
        stamp: 'attestation',
        layer: 'Brain',
        narration:
          'The FHEVM co-processor verified the encrypted amount and prepared the FHE.sub() and FHE.add() operations for the transfer.',
        delayMs: 3100, // think bubble visible
      },
      {
        id: 's-chain-swap',
        glyph: 'swap',
        stamp: 'chain',
        layer: 'Chain',
        narration:
          'AnimaRegistryRouter.wrap() called the official ERC-7984 wrapper — USDC became cUSDC without ever revealing the amount.',
        proofHref: ETHERSCAN_ADDR + ANIMA_REGISTRY,
        delayMs: 5000, // chain.tx tool ✓ confirms
      },
      {
        id: 's-storage',
        glyph: 'lock',
        stamp: 'storage',
        layer: 'Memory',
        narration:
          'The recipient was granted FHE.allow() on the transferred euint64 handle — only they can decrypt via EIP-712.',
        delayMs: 6000, // memory.save tool ✓ confirms
      },
      {
        id: 's-anchor',
        glyph: 'anchor',
        stamp: 'chain',
        layer: 'Chain',
        narration:
          'The entire transfer is settled on Ethereum Sepolia. Both wrap and transfer are verified on Etherscan.',
        proofHref: ETHERSCAN_ADDR + ANIMA_REGISTRY,
        delayMs: 7500, // ~1.2s after reply lands
      },
    ],
  },

  // ─── Cycle 3 , TUI · confidential distribution ────────────────────────
  // TuiCanvas: commit at 2800, tools at 2800 stagger 700ms.
  // tokenops.createDistribution (idx 2) at 4200. chain.tx (idx 4) at 5600.
  // memory.save (idx 5) at 6300. Reply at 7600.
  commerce: {
    intro: INTRO,
    outcome: 'Airdrop #3 created · log saved to /distributions/airdrop-001',
    receipts: [
      {
        id: 'c-sign',
        glyph: 'sign',
        stamp: 'wallet',
        layer: 'You',
        narration: 'Your wallet signed the distribution creation intent — 12 encrypted recipient amounts batched into one multi-proof.',
        delayMs: 2900, // just after commit
      },
      {
        id: 'c-attest',
        glyph: 'brain',
        stamp: 'attestation',
        layer: 'Brain',
        narration:
          'The FHEVM co-processor validated all 12 ZKPoKs simultaneously and converted each ciphertext to a recipient-bound euint64 handle.',
        delayMs: 3300, // just before tools
      },
      {
        id: 'c-inbox',
        glyph: 'gavel',
        stamp: 'inbox',
        layer: 'Commerce',
        narration:
          'AnimaDisperse.createDistribution() stored all 12 encrypted allocations as a single mapping entry. The recipient list is never revealed on-chain.',
        proofHref: ETHERSCAN_ADDR + ANIMA_DISPERSE,
        delayMs: 4400, // tokenops.createDistribution tool ✓
      },
      {
        id: 'c-market',
        glyph: 'message',
        stamp: 'market',
        layer: 'Chain',
        narration:
          'Each recipient can call requestDecryptPermit(distId) to get FHE.allow() on their own allocation — one EIP-712 sig reveals only their amount.',
        proofHref: ETHERSCAN_ADDR + ANIMA_DISPERSE,
        delayMs: 5800, // chain.tx tool ✓
      },
      {
        id: 'c-storage',
        glyph: 'lock',
        stamp: 'storage',
        layer: 'Memory',
        narration:
          'The distribution parameters (cliff + linear vesting) are encrypted on-chain. No one, not even the distributor, can see the schedule without a decrypt permit.',
        delayMs: 6700, // memory.save tool ✓
      },
    ],
  },

  // ─── Cycle 4 , TG · earn yield on Morpho ─────────────────────────────
  // TgCanvas: greeting 200/800/1500, main user at 2400, think at 3000,
  // tools at 3800 stagger 380ms. chain.tx (idx 3) at 4940. memory.save
  // (idx 4) at 5320. Reply at ~6300.
  stake: {
    intro: INTRO,
    outcome: '3,000 USDC earning yield on Morpho · encrypted the whole way',
    receipts: [
      {
        id: 'st-sign',
        glyph: 'sign',
        stamp: 'wallet',
        layer: 'You',
        narration: 'Your wallet signed the shield + yield deposit intent — the amount never left your browser as plaintext.',
        delayMs: 2500, // main user prompt commits
      },
      {
        id: 'st-attest',
        glyph: 'brain',
        stamp: 'attestation',
        layer: 'Brain',
        narration:
          'The FHEVM co-processor verified the ZKPoK and routed the encrypted balance directly into the Morpho vault interface — no decryption step.',
        delayMs: 3100, // think bubble visible
      },
      {
        id: 'st-chain-stake',
        glyph: 'stake',
        stamp: 'chain',
        layer: 'Chain',
        narration:
          'AnimaPayroll.earnYield() deposited the shielded balance into the Steakhouse Confidential Prime USDC vault on Morpho. Amount stays encrypted through the entire yield pipeline.',
        proofHref: ETHERSCAN_ADDR + ANIMA_PAYROLL,
        delayMs: 4500, // chain.tx tool ✓
      },
      {
        id: 'st-storage',
        glyph: 'lock',
        stamp: 'storage',
        layer: 'Memory',
        narration:
          'The TVS (Total Value Shielded) feed updates automatically via IERC7984.totalEncryptedSupply() — no decryption needed to track shielded volume.',
        delayMs: 5500, // memory.save tool ✓
      },
      {
        id: 'st-anchor',
        glyph: 'anchor',
        stamp: 'chain',
        layer: 'Chain',
        narration:
          'All three contracts — Payroll, Registry, Disperse — are deployed and verified on Etherscan. Real code, real transactions, real FHE.',
        proofHref: ETHERSCAN_ADDR + ANIMA_PAYROLL,
        delayMs: 7000, // ~1.1s after reply lands
      },
    ],
  },
}
