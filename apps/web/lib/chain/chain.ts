import { sepolia } from 'viem/chains'

/**
 * Anima runs exclusively on Ethereum Sepolia (chainId 11155111).
 * Re-exported for consistent import paths across the app.
 */
export { sepolia }

export const SUPPORTED_CHAIN_IDS = [sepolia.id] as const

export function explorerTxUrl(txHash: string): string {
  return `https://sepolia.etherscan.io/tx/${txHash}`
}

export function explorerAddrUrl(addr: string): string {
  return `https://sepolia.etherscan.io/address/${addr}`
}
