import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from './ThemeProvider'
import { ThemeToggle } from './ThemeToggle'

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('ThemeToggle', () => {
  it('renders all three theme options (Light, Auto, Dark)', () => {
    renderWithTheme(<ThemeToggle />)
    const group = screen.getByRole('radiogroup', { name: /theme/i })
    expect(group).toBeInTheDocument()

    const radios = within(group).getAllByRole('radio')
    expect(radios).toHaveLength(3)
    expect(radios[0]).toHaveAccessibleName(/light/i)
    expect(radios[1]).toHaveAccessibleName(/system/i)
    expect(radios[2]).toHaveAccessibleName(/dark/i)
  })

  it('has correct aria attributes on the radiogroup', () => {
    renderWithTheme(<ThemeToggle />)
    const group = screen.getByRole('radiogroup')
    expect(group).toHaveAttribute('aria-label', 'Theme')
  })

  it('marks the auto (system) option as checked by default', () => {
    renderWithTheme(<ThemeToggle />)
    const auto = screen.getByRole('radio', { name: /system/i })
    expect(auto).toHaveAttribute('aria-checked', 'true')
  })

  it('applies active styling to the checked (auto) option', () => {
    renderWithTheme(<ThemeToggle />)
    const auto = screen.getByRole('radio', { name: /system/i })
    // Active options have a different text color class
    expect(auto.className).toContain('text-[var(--color-cream)]')
  })

  it('marks unchecked options (light and dark) as not checked', () => {
    renderWithTheme(<ThemeToggle />)
    const light = screen.getByRole('radio', { name: /light/i })
    const dark = screen.getByRole('radio', { name: /dark/i })
    expect(light).toHaveAttribute('aria-checked', 'false')
    expect(dark).toHaveAttribute('aria-checked', 'false')
  })

  it('switches checked state when clicking Dark', async () => {
    const user = userEvent.setup()
    renderWithTheme(<ThemeToggle />)

    // Click Dark
    await user.click(screen.getByRole('radio', { name: /dark/i }))

    // Dark should now be checked, Light should not
    expect(screen.getByRole('radio', { name: /dark/i })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: /light/i })).toHaveAttribute('aria-checked', 'false')
  })

  it('switches checked state when clicking Auto', async () => {
    const user = userEvent.setup()
    renderWithTheme(<ThemeToggle />)

    // Click Auto
    await user.click(screen.getByRole('radio', { name: /system/i }))

    expect(screen.getByRole('radio', { name: /system/i })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: /light/i })).toHaveAttribute('aria-checked', 'false')
  })

  it('renders SVG icons for each option', () => {
    renderWithTheme(<ThemeToggle />)
    const buttons = screen.getAllByRole('radio')
    for (const btn of buttons) {
      // Each button should contain an SVG
      expect(btn.querySelector('svg')).toBeInTheDocument()
    }
  })

  it('renders visual labels (Light / Auto / Dark) for each option', () => {
    renderWithTheme(<ThemeToggle />)
    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Auto')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
  })
})
