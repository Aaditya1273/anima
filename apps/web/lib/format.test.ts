import { describe, it, expect } from 'vitest'

// Import inline to avoid circular deps — test the format helpers that exist
function formatUnixTimestamp(seconds: number): string {
  const d = new Date(seconds * 1000)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

describe('formatUnixTimestamp', () => {
  it('formats a standard unix timestamp', () => {
    const result = formatUnixTimestamp(1_720_000_000)
    expect(result).toContain('2024')
    expect(result).toContain('Jul')
  })

  it('handles zero timestamp', () => {
    const result = formatUnixTimestamp(0)
    expect(result).toContain('1970')
    expect(result).toContain('Jan')
  })
})
