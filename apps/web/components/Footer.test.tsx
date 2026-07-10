import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { Footer } from './Footer'

function renderWithProviders(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('Footer', () => {
  it('renders the anima wordmark linking to /', () => {
    renderWithProviders(<Footer />)
    // getByRole('link', { name: /anima/i }) also matches "AnimaPayroll".
    // Use href to uniquely identify the wordmark.
    const links = screen.getAllByRole('link', { name: /anima/i })
    const wordmark = links.find(l => l.getAttribute('href') === '/')
    expect(wordmark).toBeInTheDocument()
    expect(wordmark).toHaveTextContent('anima')
  })

  it('renders the project description', () => {
    renderWithProviders(<Footer />)
    expect(
      screen.getByText(/Programmable confidential finance/i),
    ).toBeInTheDocument()
  })

  it('renders all project links', () => {
    renderWithProviders(<Footer />)
    // The ↗ span has aria-hidden so the accessible name excludes it.
    // Use role query with the visible label text instead.
    const labels = ['GitHub', 'README', 'Zama FHEVM', 'ERC-7984']
    for (const label of labels) {
      expect(screen.getByRole('link', { name: new RegExp(label, 'i') })).toBeInTheDocument()
    }
  })

  it('external project links open in a new tab', () => {
    renderWithProviders(<Footer />)
    const github = screen.getByRole('link', { name: /github/i })
    expect(github).toHaveAttribute('target', '_blank')
    expect(github).toHaveAttribute('rel', 'noreferrer')
  })

  it('renders all three contract entries with truncated addresses', () => {
    renderWithProviders(<Footer />)
    expect(screen.getByText('AnimaPayroll')).toBeInTheDocument()
    expect(screen.getByText('AnimaRegistryRouter')).toBeInTheDocument()
    expect(screen.getByText('AnimaDisperse')).toBeInTheDocument()
  })

  it('contract links point to etherscan', () => {
    renderWithProviders(<Footer />)
    const payrollLink = screen.getByText('AnimaPayroll').closest('a')
    expect(payrollLink?.getAttribute('href')).toMatch(/etherscan\.io/)
  })

  it('renders the community link', () => {
    renderWithProviders(<Footer />)
    expect(screen.getByRole('link', { name: /@Aaditya1273/i })).toBeInTheDocument()
  })

  it('renders the copyright line', () => {
    renderWithProviders(<Footer />)
    expect(screen.getByText(/© 2026/)).toBeInTheDocument()
  })

  it('renders the ThemeToggle component', () => {
    renderWithProviders(<Footer />)
    expect(screen.getByRole('radiogroup', { name: /theme/i })).toBeInTheDocument()
  })

  it('renders the "Verify on Chain" column label', () => {
    renderWithProviders(<Footer />)
    expect(screen.getByText('Verify on Chain')).toBeInTheDocument()
  })
})
