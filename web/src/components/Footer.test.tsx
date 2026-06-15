import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Footer } from './Footer'
import { site } from '@/content/site'

describe('Footer', () => {
  it('renders the brand, tagline and email', () => {
    render(<Footer />)
    expect(screen.getByText(site.brand)).toBeInTheDocument()
    expect(screen.getByText(/Websites for health & wellness/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: site.email })).toHaveAttribute('href', `mailto:${site.email}`)
  })
})
