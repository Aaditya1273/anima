import {
  ANIMA_DISPERSE_ADDRESS,
  ANIMA_PAYROLL_ADDRESS,
  ANIMA_REGISTRY_ROUTER_ADDRESS,
} from '@anima/shared'

const CHAINSCAN_BASE = 'https://sepolia.etherscan.io'

export const CONTRACTS = {
  AnimaPayroll: ANIMA_PAYROLL_ADDRESS,
  AnimaRegistryRouter: ANIMA_REGISTRY_ROUTER_ADDRESS,
  AnimaDisperse: ANIMA_DISPERSE_ADDRESS,
} as const

export function txUrl(hash: string) {
  return `${CHAINSCAN_BASE}/tx/${hash}`
}

export function addressUrl(address: string) {
  return `${CHAINSCAN_BASE}/address/${address}`
}

export function tokenUrl(contract: string, tokenId: string | number) {
  return `${CHAINSCAN_BASE}/token/${contract}?tokenId=${tokenId}`
}

export function truncate(value: string, head = 6, tail = 4): string {
  if (!value) return ''
  if (value.length <= head + tail + 2) return value
  return `${value.slice(0, head)}…${value.slice(-tail)}`
}
