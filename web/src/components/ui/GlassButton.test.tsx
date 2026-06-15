import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GlassButton } from './GlassButton'

describe('GlassButton', () => {
  it('renders an anchor with the variant class and href', () => {
    render(<GlassButton href="#work" variant="clear">See recent work</GlassButton>)
    const a = screen.getByRole('link', { name: 'See recent work' })
    expect(a).toHaveAttribute('href', '#work')
    expect(a).toHaveClass('btn-glass-clear')
  })
  it('adds target/rel when external', () => {
    render(<GlassButton href="https://x.test" variant="blue" external>Book</GlassButton>)
    const a = screen.getByRole('link', { name: 'Book' })
    expect(a).toHaveAttribute('target', '_blank')
    expect(a).toHaveAttribute('rel', 'noopener noreferrer')
    expect(a).toHaveClass('btn-glass-blue')
  })
})
