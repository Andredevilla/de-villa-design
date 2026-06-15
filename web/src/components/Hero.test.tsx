import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Hero } from './Hero'
import { site } from '@/content/site'

describe('Hero', () => {
  it('renders the H1 with the gradient accent words', () => {
    render(<Hero />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('Calm, beautiful websites that fill your books.')
    expect(h1.querySelector('.gradient-text')).toHaveTextContent('fill your books.')
  })
  it('renders both hero CTAs with correct targets', () => {
    render(<Hero />)
    expect(screen.getByRole('link', { name: 'Book a free chat' })).toHaveAttribute('href', site.calendly)
    expect(screen.getByRole('link', { name: /See recent work/ })).toHaveAttribute('href', '#work')
  })
})
