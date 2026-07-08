/**
 * Contract ABIs extracted from Hardhat compilation artifacts.
 * Source: contracts/artifacts/src/<contract-name>/contract.json
 *
 * FHE types on-chain:
 *   euint64        → bytes32  (encrypted handle, on-chain storage)
 *   externalEuint64 → bytes32  (user-supplied encrypted input + ZKPoK)
 
 */

// ─── AnimaPayroll ─────────────────────────────────────────────────────────────

export const ANIMA_PAYROLL_ABI = [
  // ── Events ──────────────────────────────────────────────────────────────────
  {
    type: 'event', name: 'ObserverUpdated',
    inputs: [
      { name: 'granter',  type: 'address', indexed: true },
      { name: 'observer', type: 'address', indexed: true },
      { name: 'granted',  type: 'bool',    indexed: false },
    ],
  },
  {
    type: 'event', name: 'SalaryPaid',
    inputs: [
      { name: 'payer',    type: 'address', indexed: true },
      { name: 'employee', type: 'address', indexed: true },
      { name: 'token',    type: 'address', indexed: true },
    ],
  },
  {
    type: 'event', name: 'Withdrawal',
    inputs: [
      { name: 'employee', type: 'address', indexed: true },
      { name: 'token',    type: 'address', indexed: true },
    ],
  },
  {
    type: 'event', name: 'YieldDeposited',
    inputs: [
      { name: 'employee',    type: 'address', indexed: true },
      { name: 'morphoVault', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event', name: 'YieldWithdrawn',
    inputs: [
      { name: 'employee',    type: 'address', indexed: true },
      { name: 'morphoVault', type: 'address', indexed: true },
    ],
  },

  // ── View functions ───────────────────────────────────────────────────────────
  {
    type: 'function', name: 'getBalance', stateMutability: 'view',
    inputs:  [{ name: 'token', type: 'address' }],
    outputs: [{ name: '', type: 'bytes32' }],  // euint64 handle
  },
  {
    type: 'function', name: 'getYieldBalance', stateMutability: 'view',
    inputs:  [{ name: 'token', type: 'address' }],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    type: 'function', name: 'isObserver', stateMutability: 'view',
    inputs:  [
      { name: 'granter',  type: 'address' },
      { name: 'observer', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function', name: 'confidentialProtocolId', stateMutability: 'view',
    inputs:  [],
    outputs: [{ name: '', type: 'uint256' }],
  },

  // ── Write functions ──────────────────────────────────────────────────────────
  {
    type: 'function', name: 'grantObserver', stateMutability: 'nonpayable',
    inputs:  [
      { name: 'observer', type: 'address' },
      { name: 'granted',  type: 'bool' },
    ],
    outputs: [],
  },
  {
    type: 'function', name: 'paySalary', stateMutability: 'nonpayable',
    inputs:  [
      { name: 'token',     type: 'address' },
      { name: 'employee',  type: 'address' },
      { name: 'encAmount', type: 'bytes32' }, // externalEuint64
      { name: 'proof',     type: 'bytes' },
    ],
    outputs: [],
  },
  {
    type: 'function', name: 'withdraw', stateMutability: 'nonpayable',
    inputs:  [
      { name: 'token',     type: 'address' },
      { name: 'encAmount', type: 'bytes32' },
      { name: 'proof',     type: 'bytes' },
    ],
    outputs: [],
  },
  {
    type: 'function', name: 'earnYield', stateMutability: 'nonpayable',
    inputs:  [
      { name: 'token',       type: 'address' },
      { name: 'morphoVault', type: 'address' },
      { name: 'encAmount',   type: 'bytes32' },
      { name: 'proof',       type: 'bytes' },
    ],
    outputs: [],
  },
  {
    type: 'function', name: 'withdrawYield', stateMutability: 'nonpayable',
    inputs:  [
      { name: 'token',       type: 'address' },
      { name: 'morphoVault', type: 'address' },
      { name: 'encAmount',   type: 'bytes32' },
      { name: 'proof',       type: 'bytes' },
    ],
    outputs: [],
  },
] as const

// ─── AnimaRegistryRouter ──────────────────────────────────────────────────────

export const ANIMA_REGISTRY_ROUTER_ABI = [
  // ── Events ──────────────────────────────────────────────────────────────────
  {
    type: 'event', name: 'Wrapped',
    inputs: [
      { name: 'user',   type: 'address', indexed: true },
      { name: 'pairId', type: 'uint256', indexed: true },
      { name: 'erc7984', type: 'address', indexed: false },
    ],
  },
  {
    type: 'event', name: 'Unwrapped',
    inputs: [
      { name: 'user',   type: 'address', indexed: true },
      { name: 'pairId', type: 'uint256', indexed: true },
      { name: 'erc7984', type: 'address', indexed: false },
    ],
  },
  {
    type: 'event', name: 'DecryptPermitGranted',
    inputs: [
      { name: 'user',  type: 'address', indexed: true },
      { name: 'token', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event', name: 'Faucet',
    inputs: [
      { name: 'user',   type: 'address', indexed: true },
      { name: 'token',  type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },

  // ── View functions ───────────────────────────────────────────────────────────
  {
    type: 'function', name: 'officialPairCount', stateMutability: 'view',
    inputs:  [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function', name: 'officialRegistry', stateMutability: 'view',
    inputs:  [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function', name: 'getPair', stateMutability: 'view',
    inputs:  [{ name: 'pairId', type: 'uint256' }],
    outputs: [
      {
        name: '', type: 'tuple',
        components: [
          { name: 'erc20',    type: 'address' },
          { name: 'erc7984',  type: 'address' },
          { name: 'name',     type: 'string' },
          { name: 'symbol',   type: 'string' },
          { name: 'decimals', type: 'uint8' },
        ],
      },
    ],
  },
  {
    type: 'function', name: 'getPairByERC20', stateMutability: 'view',
    inputs:  [{ name: 'erc20', type: 'address' }],
    outputs: [
      {
        name: '', type: 'tuple',
        components: [
          { name: 'erc20',    type: 'address' },
          { name: 'erc7984',  type: 'address' },
          { name: 'name',     type: 'string' },
          { name: 'symbol',   type: 'string' },
          { name: 'decimals', type: 'uint8' },
        ],
      },
    ],
  },
  {
    type: 'function', name: 'confidentialProtocolId', stateMutability: 'view',
    inputs:  [],
    outputs: [{ name: '', type: 'uint256' }],
  },

  // ── Write functions ──────────────────────────────────────────────────────────
  {
    type: 'function', name: 'wrap', stateMutability: 'nonpayable',
    inputs:  [
      { name: 'pairId',    type: 'uint256' },
      { name: 'encAmount', type: 'bytes32' },
      { name: 'proof',     type: 'bytes' },
    ],
    outputs: [],
  },
  {
    type: 'function', name: 'unwrap', stateMutability: 'nonpayable',
    inputs:  [
      { name: 'pairId',    type: 'uint256' },
      { name: 'encAmount', type: 'bytes32' },
      { name: 'proof',     type: 'bytes' },
    ],
    outputs: [],
  },
  {
    type: 'function', name: 'grantDecryptPermit', stateMutability: 'nonpayable',
    inputs:  [{ name: 'token', type: 'address' }],
    outputs: [],
  },
  {
    type: 'function', name: 'faucet', stateMutability: 'nonpayable',
    inputs:  [
      { name: 'token',  type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
] as const

// ─── AnimaDisperse ────────────────────────────────────────────────────────────

export const ANIMA_DISPERSE_ABI = [
  // ── Events ──────────────────────────────────────────────────────────────────
  {
    type: 'event', name: 'DistributionCreated',
    inputs: [
      { name: 'id',             type: 'uint256', indexed: true },
      { name: 'distributor',    type: 'address', indexed: true },
      { name: 'token',          type: 'address', indexed: true },
      { name: 'recipientCount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event', name: 'DecryptPermitGranted',
    inputs: [
      { name: 'id',        type: 'uint256', indexed: true },
      { name: 'recipient', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event', name: 'Claimed',
    inputs: [
      { name: 'id',        type: 'uint256', indexed: true },
      { name: 'recipient', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event', name: 'Cancelled',
    inputs: [
      { name: 'id',          type: 'uint256', indexed: true },
      { name: 'distributor', type: 'address', indexed: true },
    ],
  },

  // ── View functions ───────────────────────────────────────────────────────────
  {
    type: 'function', name: 'distributionCount', stateMutability: 'view',
    inputs:  [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function', name: 'claimed', stateMutability: 'view',
    inputs:  [
      { name: 'id',        type: 'uint256' },
      { name: 'recipient', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function', name: 'getAllocation', stateMutability: 'view',
    inputs:  [{ name: 'id', type: 'uint256' }],
    outputs: [{ name: '', type: 'bytes32' }], // euint64 handle
  },
  {
    type: 'function', name: 'getDistribution', stateMutability: 'view',
    inputs:  [{ name: 'id', type: 'uint256' }],
    outputs: [
      { name: 'token',          type: 'address' },
      { name: 'distributor',    type: 'address' },
      { name: 'createdAt',      type: 'uint256' },
      { name: 'recipientCount', type: 'uint256' },
      { name: 'active',         type: 'bool' },
      { name: 'vestingCliff',   type: 'uint64' },
      { name: 'vestingLinear',  type: 'uint64' },
    ],
  },

  // ── Write functions ──────────────────────────────────────────────────────────
  {
    type: 'function', name: 'createDistribution', stateMutability: 'nonpayable',
    inputs:  [
      { name: 'token',      type: 'address' },
      { name: 'recipients', type: 'address[]' },
      { name: 'encAmounts', type: 'bytes32[]' },
      { name: 'proofs',     type: 'bytes[]' },
      {
        name: 'vesting', type: 'tuple',
        components: [
          { name: 'cliff',  type: 'uint64' },
          { name: 'linear', type: 'uint64' },
        ],
      },
    ],
    outputs: [{ name: 'id', type: 'uint256' }],
  },
  {
    type: 'function', name: 'requestDecryptPermit', stateMutability: 'nonpayable',
    inputs:  [{ name: 'id', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function', name: 'claim', stateMutability: 'nonpayable',
    inputs:  [{ name: 'id', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function', name: 'cancel', stateMutability: 'nonpayable',
    inputs:  [
      { name: 'id',         type: 'uint256' },
      { name: 'recipients', type: 'address[]' },
      { name: 'encAmounts', type: 'bytes32[]' },
      { name: 'proofs',     type: 'bytes[]' },
    ],
    outputs: [],
  },
] as const
