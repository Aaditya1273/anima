import { describe, it, expect } from 'vitest'
import { truncate, addressUrl, CONTRACTS } from './chainscan'

describe('truncate', () => {
  it('truncates a hex address with default prefix/suffix lengths', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678'
    expect(truncate(addr)).toBe('0x1234…5678')
  })

  it('uses custom prefix and suffix lengths', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678'
    // head=8 includes the 0x prefix: slice(0,8) = '0x123456'
    expect(truncate(addr, 8, 6)).toBe('0x123456…345678')
  })

  it('returns empty string for empty input', () => {
    expect(truncate('')).toBe('')
  })

  it('handles short addresses gracefully', () => {
    expect(truncate('0x1234')).toBe('0x1234')
  })

  it('handles undefined gracefully', () => {
    expect(truncate(undefined as unknown as string)).toBe('')
  })
})

describe('addressUrl', () => {
  it('builds a Sepolia Etherscan URL', () => {
    const url = addressUrl('0x1234567890abcdef1234567890abcdef12345678')
    expect(url).toBe('https://sepolia.etherscan.io/address/0x1234567890abcdef1234567890abcdef12345678')
  })
})

describe('CONTRACTS', () => {
  it('exports contract address constants', () => {
    expect(CONTRACTS.AnimaPayroll).toBeDefined()
    expect(CONTRACTS.AnimaPayroll).toMatch(/^0x[a-f0-9]{40}$/i)
    expect(CONTRACTS.AnimaRegistryRouter).toMatch(/^0x[a-f0-9]{40}$/i)
    expect(CONTRACTS.AnimaDisperse).toMatch(/^0x[a-f0-9]{40}$/i)
  })
})
