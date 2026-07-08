const CHAINSCAN_BASE = 'https://sepolia.etherscan.io'

export const CONTRACTS = {
  AnimaPayroll: '0x86ba59BdC7c6854610892B8a7B76294a94b8d1cB',
  AnimaRegistryRouter: '0x447356d0825409428F1D90E65e067A3710599f83',
  AnimaDisperse: '0xdF687b7fD99E9291CD0633F8c122A8ff8712Ab61',
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
