/**
 * Deployed contract addresses on Ethereum Sepolia (chainId 11155111).
 * This file is auto-overwritten by `pnpm deploy:sepolia`.
 * Replace placeholder values once you have run the deployment.
 */

export const SEPOLIA_CHAIN_ID = 11155111

export const ANIMA_PAYROLL_ADDRESS =
  '0x0000000000000000000000000000000000000000' as `0x${string}`

export const ANIMA_REGISTRY_ROUTER_ADDRESS =
  '0x0000000000000000000000000000000000000000' as `0x${string}`

export const ANIMA_DISPERSE_ADDRESS =
  '0x0000000000000000000000000000000000000000' as `0x${string}`

/**
 * Official Zama Wrappers Registry on Sepolia.
 * Source: https://docs.zama.ai/protocol/addresses
 */
export const ZAMA_WRAPPERS_REGISTRY_ADDRESS =
  '0x0000000000000000000000000000000000000000' as `0x${string}`

export const CONTRACT_ADDRESSES = {
  animaPayroll: ANIMA_PAYROLL_ADDRESS,
  animaRegistryRouter: ANIMA_REGISTRY_ROUTER_ADDRESS,
  animaDisperse: ANIMA_DISPERSE_ADDRESS,
  zamaWrappersRegistry: ZAMA_WRAPPERS_REGISTRY_ADDRESS,
} as const
