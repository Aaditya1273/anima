import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'viem'
import { sepolia } from 'viem/chains'

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? 'anima-dev'

export const wagmiConfig = getDefaultConfig({
  appName: 'anima · confidential finance',
  projectId,
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
  ssr: true,
})
