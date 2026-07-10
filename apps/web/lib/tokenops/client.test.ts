import { describe, it, expect } from 'vitest'
import { estimateMevExposure } from './client'

describe('estimateMevExposure', () => {
  it('calculates 17% MEV exposure for a given total', () => {
    const result = estimateMevExposure(10_000n)
    expect(result.exposedAmount).toBe(1_700n)
    expect(result.percentage).toBe(0.17)
    expect(result.label).toContain('17%')
  })

  it('returns zero exposure for zero amount', () => {
    const result = estimateMevExposure(0n)
    expect(result.exposedAmount).toBe(0n)
  })

  it('rounds down for non-divisible amounts', () => {
    const result = estimateMevExposure(100n)
    // 100 * 17 / 100 = 17
    expect(result.exposedAmount).toBe(17n)
  })

  it('handles large BigInt values', () => {
    const large = 1_000_000_000_000_000_000n
    const result = estimateMevExposure(large)
    expect(result.exposedAmount).toBe(large * 17n / 100n)
  })
})
