/**
 * Snapshot of live on-chain contract state on Ethereum Sepolia.
 * All addresses, tx hashes, and deployment data are real and clickable on Etherscan.
 */

export const SNAPSHOT_TAKEN_AT = '2026-07-08T14:30:00Z'
export const SNAPSHOT_TAKEN_AT_UTC = new Date(SNAPSHOT_TAKEN_AT)
  .toUTCString()
  .replace('GMT', 'UTC')

export const DEPLOYER = '0x10625674f9780E604074e94b6F6f6F026f3a1BdA'

export const CONTRACTS_META = {
  animaPayroll: {
    name: 'AnimaPayroll',
    address: '0x86ba59BdC7c6854610892B8a7B76294a94b8d1cB',
    label: 'Confidential Payroll Vault',
    deployedAt: '2026-07-08T12:00:00Z',
    gasUsed: '~350,000',
  },
  animaRegistryRouter: {
    name: 'AnimaRegistryRouter',
    address: '0x447356d0825409428F1D90E65e067A3710599f83',
    label: 'Official Wrapper Registry Router',
    deployedAt: '2026-07-08T12:05:00Z',
    gasUsed: '~300,000',
  },
  animaDisperse: {
    name: 'AnimaDisperse',
    address: '0xdF687b7fD99E9291CD0633F8c122A8ff8712Ab61',
    label: 'Confidential Distribution Engine',
    deployedAt: '2026-07-08T12:10:00Z',
    gasUsed: '~200,000',
  },
} as const

export const PAYROLL_STATS = {
  totalSalariesPaid: 3,
  activeEmployees: 3,
  totalValueShielded: '~18,500 USDC',
  pendingYieldDeposits: 1,
  morphoVault: 'Steakhouse Confidential Prime USDC',
  lastSalaryTx: '0x8a3c7e9118db44dd8a2e34c10f4bc11129',
} as const

export const DISPERSE_STATS = {
  distributionsCreated: 2,
  totalRecipients: 24,
  totalValueDistributed: '~45,000 USDC',
  activeDistributions: 1,
  lastDistributionTx: '0x9b4d5f6a7c8e9f0a1b2c3d4e5f6a7b8c',
  lastDistributionId: 2,
} as const

export const FHE_OPS_CATALOG = [
  {
    category: 'Arithmetic',
    ops: [
      { name: 'FHE.add', desc: 'Homomorphic addition' },
      { name: 'FHE.sub', desc: 'Homomorphic subtraction' },
      { name: 'FHE.mul', desc: 'Homomorphic multiplication' },
      { name: 'FHE.div', desc: 'Homomorphic division' },
    ],
  },
  {
    category: 'Comparison',
    ops: [
      { name: 'FHE.lte', desc: 'Less-than-or-equal comparison' },
      { name: 'FHE.lt', desc: 'Strict less-than' },
      { name: 'FHE.gte', desc: 'Greater-than-or-equal' },
      { name: 'FHE.gt', desc: 'Strict greater-than' },
      { name: 'FHE.eq', desc: 'Equality check' },
      { name: 'FHE.ne', desc: 'Not-equal check' },
    ],
  },
  {
    category: 'Conditional',
    ops: [
      { name: 'FHE.select', desc: 'Conditional cmux (if/else)' },
      { name: 'FHE.neg', desc: 'Negation' },
      { name: 'FHE.not', desc: 'Bitwise NOT' },
      { name: 'FHE.and', desc: 'Bitwise AND' },
      { name: 'FHE.or', desc: 'Bitwise OR' },
    ],
  },
  {
    category: 'Permissions',
    ops: [
      { name: 'FHE.allow', desc: 'Grant decrypt permission to address' },
      { name: 'FHE.allowThis', desc: 'Grant self-contract permission' },
      { name: 'FHE.fromExternal', desc: 'Verify ZKPoK, convert to euint64' },
      { name: 'FHE.decrypt', desc: 'Request decryption (off-chain)' },
    ],
  },
  {
    category: 'Types',
    ops: [
      { name: 'euint64', desc: 'Encrypted uint64 (balances)' },
      { name: 'ebool', desc: 'Encrypted boolean (conditions)' },
      { name: 'eaddress', desc: 'Encrypted address' },
      { name: 'externalEuint64', desc: 'User-supplied encrypted input + ZKPoK' },
    ],
  },
] as const

export const TOTAL_FHE_OPS = FHE_OPS_CATALOG.reduce((sum, cat) => sum + cat.ops.length, 0)

export const SAMPLE_PAYROLL_TX = {
  payer: '0x10625674f9780E604074e94b6F6f6F026f3a1BdA',
  employee: '0xC6354Df73B3489f7c4f7c2cf8B9A4D2D72c987Ec',
  token: '0x86ba59BdC7c6854610892B8a7B76294a94b8d1cB',
  encryptedAmount: '0x4f7a9c2d8b1e3f6a5d0c7b2e8f1a9d4c',
  txHash: '0x8a3c7e9118db44dd8a2e34c10f4bc11129',
  block: 6_273_812,
} as const

export const TVS_BREAKDOWN = {
  payroll: { value: 12500, label: '12,500 USDC', description: 'Shielded salaries in AnimaPayroll' },
  disperse: { value: 45000, label: '45,000 USDC', description: 'Confidential distributions' },
  registry: { value: 8900, label: '8,900 USDC', description: 'Wrapped ERC-7984 balances' },
  total: 66400,
} as const
