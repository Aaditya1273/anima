'use client'

import { ZamaProvider } from '@zama-fhe/react-sdk'
import { createConfig } from '@zama-fhe/react-sdk/wagmi'
import { web } from '@zama-fhe/sdk/web'
import { sepolia as sepoliaFhe, type FheChain } from '@zama-fhe/sdk/chains'
import { wagmiConfig } from '@/lib/wagmi'
import { type ReactNode } from 'react'

const sepolia = {
  ...sepoliaFhe,
  relayerUrl: '/api/relayer/11155111',
} as const satisfies FheChain

const zamaConfig = createConfig({
  chains: [sepolia],
  wagmiConfig,
  relayers: {
    [sepolia.id]: web(),
  },
})

export function ZamaProviderInner({ children }: { children: ReactNode }) {
  return <ZamaProvider config={zamaConfig}>{children}</ZamaProvider>
}
