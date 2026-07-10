import { render, screen, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Navbar } from './Navbar'

describe('Navbar', () => {
  // ── Brand / Logo ──────────────────────────────────────────────────────────

  it('renders the anima brand link pointing to /', () => {
    render(<Navbar />)
    const brand = screen.getByRole('link', { name: /anima home/i })
    expect(brand).toBeInTheDocument()
    expect(brand).toHaveAttribute('href', '/')
    expect(brand).toHaveTextContent('anima')
  })

  // ── Desktop nav links ────────────────────────────────────────────────────

  it('renders the Architecture (anchor) and Docs (route) nav links', () => {
    render(<Navbar />)
    expect(screen.getByText('Architecture')).toBeInTheDocument()
    expect(screen.getByText('Docs')).toBeInTheDocument()
  })

  it('Architecture link points to #section-layers', () => {
    render(<Navbar />)
    const link = screen.getByText('Architecture').closest('a')
    expect(link).toHaveAttribute('href', '#section-layers')
  })

  it('Docs link points to /docs', () => {
    render(<Navbar />)
    const link = screen.getByText('Docs').closest('a')
    expect(link).toHaveAttribute('href', '/docs')
  })

  // ── CTA ───────────────────────────────────────────────────────────────────

  it('renders the Console CTA link pointing to /console', () => {
    render(<Navbar />)
    const cta = screen.getByText(/open console/i)
    expect(cta.closest('a')).toHaveAttribute('href', '/console')
  })

  // ── Nav accessibility ────────────────────────────────────────────────────

  it('has role=navigation with aria-label primary', () => {
    render(<Navbar />)
    const nav = screen.getByRole('navigation', { name: /primary/i })
    expect(nav).toBeInTheDocument()
  })

  // ── Hamburger button (mobile) ────────────────────────────────────────────

  it('renders the hamburger menu button', () => {
    render(<Navbar />)
    const btn = screen.getByRole('button', { name: /open menu/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens the mobile menu overlay when hamburger is clicked', async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    // Menu overlay should not be visible initially
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Click hamburger
    await user.click(screen.getByRole('button', { name: /open menu/i }))

    // Menu overlay should appear
    const dialog = screen.getByRole('dialog', { name: /primary menu/i })
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('hamburger button label changes to Close menu when menu is open', async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    await user.click(screen.getByRole('button', { name: /open menu/i }))

    // Two Close-menu buttons exist: one in the navbar strip, one in the
    // mobile overlay. That's expected — both should be present.
    const closeBtns = screen.getAllByRole('button', { name: /close menu/i })
    expect(closeBtns).toHaveLength(2)
  })

  it('mobile menu contains the same nav items as the desktop', async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    await user.click(screen.getByRole('button', { name: /open menu/i }))

    // Both desktop and mobile nav render Architecture/Docs. Scope to the
    // dialog to verify the mobile overlay's copy.
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Architecture')).toBeInTheDocument()
    expect(within(dialog).getByText('Docs')).toBeInTheDocument()

    // Mobile Docs link should go to /docs
    const docsLink = within(dialog).getByText('Docs').closest('a')
    expect(docsLink).toHaveAttribute('href', '/docs')
  })

  it('mobile menu has stacked nav items in a list', async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    await user.click(screen.getByRole('button', { name: /open menu/i }))

    // The mobile nav should be inside the dialog
    const dialog = screen.getByRole('dialog')
    const nav = within(dialog).getByRole('navigation', { name: /mobile primary/i })
    expect(nav).toBeInTheDocument()
    const listItems = within(nav).getAllByRole('listitem')
    expect(listItems).toHaveLength(2) // Architecture, Docs
  })

  it('closes the mobile menu when hamburger is clicked again', async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Two Close-menu buttons exist; pick the first one (the navbar strip's
    // hamburger, which toggles setMenuOpen).
    const [closeBtn] = screen.getAllByRole('button', { name: /close menu/i })
    await user.click(closeBtn)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes the mobile menu on Escape key press', async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  // ── Lenis scroll anchor links ───────────────────────────────────────────

  it('Architecture anchor link does not crash when clicked (uses lenis)', async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    const archLink = screen.getByText('Architecture').closest('a')!
    expect(() => act(() => user.click(archLink))).not.toThrow()
  })
})
