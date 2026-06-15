import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Contact } from './Contact'
import { site } from '@/content/site'

describe('Contact', () => {
  it('renders the gradient heading and the Book-a-call CTA to Calendly', () => {
    render(<Contact />)
    const h2 = screen.getByRole('heading', { level: 2 })
    expect(h2).toHaveTextContent('Ready for a website you’re proud of?')
    expect(h2.querySelector('.gradient-text')).toHaveTextContent('proud of?')
    expect(screen.getByRole('link', { name: 'Book a call' })).toHaveAttribute('href', site.calendly)
  })
  it('shows the mailto link', () => {
    render(<Contact />)
    expect(screen.getByRole('link', { name: site.email })).toHaveAttribute('href', `mailto:${site.email}`)
  })
})
