import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { Nav } from './Nav'
import { site } from '@/content/site'

describe('Nav', () => {
  it('renders the 4 anchor links', () => {
    render(<Nav />)
    for (const link of site.nav) {
      expect(screen.getByRole('link', { name: link.label })).toHaveAttribute('href', link.href)
    }
  })
  it('renders the Calendly CTA, opening in a new tab', () => {
    render(<Nav />)
    const cta = screen.getByRole('link', { name: 'Book a free chat' })
    expect(cta).toHaveAttribute('href', site.calendly)
    expect(cta).toHaveAttribute('target', '_blank')
  })
  it('toggles the mobile menu via aria-expanded', async () => {
    render(<Nav />)
    const btn = screen.getByRole('button', { name: /toggle menu/i })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
  })
})
