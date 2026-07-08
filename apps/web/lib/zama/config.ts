'use client'

import { createConfig as createZamaConfig } from '@zama-fhe/react-sdk/wagmi'
import { web } from '@zama-fhe/sdk/web'
import { sepolia as sepoliaFhe, type FheChain } from '@zama-fhe/sdk/chains'
import { wagmiConfig } from '@/lib/wagmi'

/**
 * Override the relayerUrl to point at our server-side proxy.
 * This keeps the ZAMA_API_KEY off the browser — the proxy forwards the
 * request to Zama's network and injects the key server-side.
 */
export const sepoliaFheChain = {
  ...sepoliaFhe,
  // Proxy through our Next.js API route — keeps any future API key server-side.
  // On Sepolia testnet no key is required; the proxy forwards without one.
  relayerUrl: '/api/relayer/11155111',
} as const satisfies FheChain

export const zamaConfig = createZamaConfig({
  chains: [sepoliaFheChain],
  wagmiConfig,
  relayers: {
    [sepoliaFheChain.id]: web(),
  },
})
