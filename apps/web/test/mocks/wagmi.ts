import { vi } from 'vitest'

// Mock wagmi hooks so component tests don't require a wallet connection
vi.mock('wagmi', async () => {
  const actual = await vi.importActual('wagmi')
  return {
    ...actual,
    useAccount: vi.fn(() => ({
      address: undefined,
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      isDisconnected: true,
      chainId: 11155111,
    })),
    useReadContract: vi.fn(() => ({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })),
    useReadContracts: vi.fn(() => ({
      data: undefined,
      isLoading: false,
      error: null,
    })),
    useWriteContract: vi.fn(() => ({
      writeContractAsync: vi.fn(),
      isPending: false,
      data: undefined,
      error: null,
    })),
    useWaitForTransactionReceipt: vi.fn(() => ({
      isLoading: false,
      isSuccess: false,
      data: undefined,
    })),
    usePublicClient: vi.fn(() => null),
    useWalletClient: vi.fn(() => ({ data: undefined })),
  }
})
