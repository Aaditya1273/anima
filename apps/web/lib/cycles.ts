/**
 * 4 hero cycles for the Zama FHE / confidential finance narrative.
 * Each cycle has:
 * - surface: TUI vs TG (drives chat aesthetic)
 * - prompt: the natural-language operator prompt
 * - tool stream: ordered list of tool calls + their result indicators
 * - reply: bot's final reply
 * - artifact: the output canvas card type
 * - painting: which Aurelia wash for the canvas backdrop
 * - greeting (TG only): optional warmup turn before the main exchange
 */

export type CycleSurface = 'tui' | 'tg'
export type ToolStreamEntry = { tool: string; args?: string; status: 'ok' | 'failed' }

export type ResearchCard = {
  type: 'research'
  title: string
  sources: Array<{ name: string; url: string; preview: string }>
}
export type SwapCard = {
  type: 'swap'
  fromAmount: string
  fromSymbol: string
  toAmount: string
  toSymbol: string
  txHash: string
  newBalance: string
}
export type AuditCard = {
  type: 'audit'
  jobId: string
  agent: string
  bidAmount: string
  status: string
  reportHash: string
  txHash: string
}
export type StakeCard = {
  type: 'stake'
  position: string
  validator: string
  apr: string
  unlockBlock: number
  txHash: string
}

export type CycleArtifact = ResearchCard | SwapCard | AuditCard | StakeCard

export type CycleGreeting = { prompt: string; reply: string }

export type Cycle = {
  id: string
  surface: CycleSurface
  greeting?: CycleGreeting
  prompt: string
  toolStream: ToolStreamEntry[]
  reply: string
  artifact: CycleArtifact
  painting: 'grove' | 'cloud-islands' | 'mountain-vista' | 'tower'
  durationMs: number
}

export const CYCLES: Cycle[] = [
  // ─── Cycle 1 , TUI · shield payroll ───────────────────────────────────
  {
    id: 'research',
    surface: 'tui',
    prompt:
      'shield 5,000 USDC as confidential salary for 0x742d…3eB1 using the Zama FHE payroll vault',
    toolStream: [
      { tool: 'chain.balance', args: 'USDC', status: 'ok' },
      { tool: 'fhe.encrypt', args: '5,000 USDC → externalEuint64', status: 'ok' },
      { tool: 'contract.paySalary', args: '0x742d…3eB1 · 5,000 USDC', status: 'ok' },
      { tool: 'fhe.allow', args: 'employee decrypt permit granted', status: 'ok' },
      { tool: 'fhe.allow', args: 'auditor access granted', status: 'ok' },
      { tool: 'memory.save', args: '/vault/payroll/2026-07-08', status: 'ok' },
    ],
    reply: `Salary shielded.\n\n**5,000 USDC** deposited into AnimaPayroll for employee **0x742d…3eB1**\n\nBalance stored as **euint64** on Ethereum Sepolia — no plaintext ever touches the chain.\n\n**Decrypt permissions:**\n- Employee: ✅ can decrypt their own balance via EIP-712\n- CFO: ✅ can see encrypted aggregate only\n- Auditor 0x8f3c…2aD1: ✅ selective disclosure granted\n\nTx: sepolia.etherscan.io/tx/0x8a3c…1129\n\nOne FIAT payroll run leaked salary data across 70,000 employees. Anima makes every employee's pay visible to only them.`,
    artifact: {
      type: 'research',
      title: 'Confidential Payroll · field report',
      sources: [
        { name: 'AnimaPayroll', url: 'https://sepolia.etherscan.io/address/0x86ba59BdC7c6854610892B8a7B76294a94b8d1cB', preview: 'confidential payroll vault · FHE' },
        { name: 'Zama FHEVM docs', url: 'https://docs.zama.ai/protocol', preview: 'euint64 · ebool · FHE operations' },
        { name: 'ERC-7984', url: 'https://eips.ethereum.org/EIPS/eip-7984', preview: 'confidential token standard' },
        { name: 'EIP-712 decrypt', url: 'https://eips.ethereum.org/EIPS/eip-712', preview: 'typed data signing for decryption' },
      ],
    },
    painting: 'grove',
    durationMs: 12000,
  },

  // ─── Cycle 2 , TG · wrap + confidential transfer ──────────────────────
  {
    id: 'swap',
    surface: 'tg',
    greeting: {
      prompt: 'gm',
      reply: 'gm ☀️',
    },
    prompt: 'wrap 2,000 USDC into confidential cUSDC and transfer 500 to 0xC635…87Ec',
    toolStream: [
      { tool: 'chain.balance', args: 'USDC', status: 'ok' },
      { tool: 'fhe.encrypt', args: '2,000 USDC → externalEuint64', status: 'ok' },
      { tool: 'contract.wrap', args: '2,000 USDC → cUSDC', status: 'ok' },
      { tool: 'fhe.transfer', args: '500 cUSDC → 0xC635…87Ec', status: 'ok' },
      { tool: 'fhe.allow', args: 'recipient decrypt permit', status: 'ok' },
      { tool: 'memory.save', args: '/transfers/2026-07-08', status: 'ok' },
    ],
    reply: `Confidential transfer complete.\n\n**2,000 USDC** wrapped → cUSDC via AnimaRegistryRouter\n**500 cUSDC** transferred confidentially to 0xC635…87Ec\n\n**Route:**\nUSDC → ERC-7984 wrapper → encrypted euint64 balance → FHE.sub(sender) + FHE.add(recipient)\n\n**Recipient can decrypt** via one EIP-712 signature in their wallet. Only they see the amount.\n\nRemaining cUSDC balance: 1,500\n\nTx: sepolia.etherscan.io/tx/0x9b4d…b8c\n\nPublic airdrops expose amounts to MEV bots. Anima keeps every transfer confidential.`,
    artifact: {
      type: 'swap',
      fromAmount: '2,000',
      fromSymbol: 'USDC',
      toAmount: '1,500',
      toSymbol: 'cUSDC',
      txHash: '0x9b4d5f6a7c8e9f0a1b2c3d4e5f6a7b8c',
      newBalance: '1,500 cUSDC',
    },
    painting: 'cloud-islands',
    durationMs: 10500,
  },

  // ─── Cycle 3 , TUI · confidential distribution ────────────────────────
  {
    id: 'commerce',
    surface: 'tui',
    prompt:
      'create a confidential airdrop of 10,000 cUSDC to 12 recipients with a 30-day cliff and 180-day linear vesting',
    toolStream: [
      { tool: 'chain.balance', args: 'cUSDC', status: 'ok' },
      { tool: 'fhe.batchEncrypt', args: '12 recipients · 10,000 cUSDC', status: 'ok' },
      { tool: 'tokenops.createDistribution', args: '12 recipients', status: 'ok' },
      { tool: 'tokenops.vestingSchedule', args: 'cliff: 30d · linear: 180d', status: 'ok' },
      { tool: 'chain.tx', args: '0x3ebd…772a', status: 'ok' },
      { tool: 'memory.save', args: '/distributions/airdrop-001', status: 'ok' },
    ],
    reply: `Confidential airdrop created on AnimaDisperse.\n\n**10,000 cUSDC** distributed across **12 recipients**\n\n**Vesting schedule (all encrypted):**\n- Cliff: 30 days (no claims before)\n- Linear vesting: 180 days (pro-rata unlock daily)\n\n**On-chain visibility:**\n- Total amount: 🔒 encrypted\n- Recipient amounts: 🔒 individually encrypted (euint64 per address)\n- Schedule: 🔒 encrypted cliff + linear parameters\n\nEach recipient visits /disperse/[distId], connects wallet, signs EIP-712 → sees only their own allocation.\n\nDistribution ID: 3\nTx: sepolia.etherscan.io/tx/0x3ebd…772a\n\nPublic airdrops cause -17% average price drop in 72h from MEV front-runs. Anima makes distribution amounts invisible.`,
    artifact: {
      type: 'audit',
      jobId: '3',
      agent: 'AnimaDisperse',
      bidAmount: '10,000 cUSDC',
      status: 'created',
      reportHash: '0x8f3c7e9118db44dd8a2e34c10f4bc11129',
      txHash: '0x3ebd9f5cc2118c3ad33c3d50918e2772a',
    },
    painting: 'mountain-vista',
    durationMs: 10500,
  },

  // ─── Cycle 4 , TG · earn yield on Morpho ─────────────────────────────
  {
    id: 'stake',
    surface: 'tg',
    greeting: {
      prompt: 'hi there',
      reply: 'hi 👋 ready when you are',
    },
    prompt: 'shield 3,000 USDC into the Morpho Steakhouse Confidential Prime vault to earn yield',
    toolStream: [
      { tool: 'chain.balance', args: 'USDC', status: 'ok' },
      { tool: 'fhe.encrypt', args: '3,000 USDC → externalEuint64', status: 'ok' },
      { tool: 'contract.earnYield', args: '3,000 USDC → Morpho vault', status: 'ok' },
      { tool: 'chain.tx', args: '0x771a…c8e0', status: 'ok' },
      { tool: 'memory.save', args: '/vault/yield-positions/2026-07-08', status: 'ok' },
    ],
    reply: `Yield position opened on Morpho.\n\n**3,000 USDC** shielded into **Steakhouse Confidential Prime USDC** vault\nAmount stays encrypted as euint64 through the entire deposit cycle.\n\n**Composability proof:**\nBalance → FHE.fromExternal → FHE.add(vault.balance) → Morpho deposit\nNo decryption at any step.\n\nEstimated APY: 6.2%\nProjected earnings: ~186 USDC/year\n\nYour vault balance: 3,000 cUSDC (encrypted)\nTotal shielded across all surfaces: **66.4K USDC**\n\nTx: sepolia.etherscan.io/tx/0x771a…c8e0\n\nDeFi with compliance: earn yield without ever exposing your position to the public ledger.`,
    artifact: {
      type: 'stake',
      position: '3,000 cUSDC',
      validator: 'Steakhouse Prime',
      apr: '6.2%',
      unlockBlock: 6_381_201,
      txHash: '0x771a8e44c0d3294411fefc7b87c8e0',
    },
    painting: 'tower',
    durationMs: 10000,
  },
]
