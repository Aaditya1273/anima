import { vi } from 'vitest'

// Mock viem's public client so tests don't make real RPC calls
vi.mock('viem', async () => {
  const actual = await vi.importActual('viem')
  return {
    ...actual,
    createPublicClient: vi.fn(() => ({
      getChainId: vi.fn().mockResolvedValue(11155111),
      getBlockNumber: vi.fn().mockResolvedValue(6_500_000n),
      readContract: vi.fn().mockResolvedValue(null),
    })),
    createWalletClient: vi.fn(() => ({
      getAddresses: vi.fn().mockResolvedValue(['0x1234567890123456789012345678901234567890']),
      sendTransaction: vi.fn().mockResolvedValue('0xtxhash'),
    })),
  }
})
