import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Services } from './Services'

describe('Services', () => {
  it('renders the section heading and 3 service cards', () => {
    const { container } = render(<Services />)
    expect(screen.getByRole('heading', { level: 2, name: 'What I can do for you' })).toBeInTheDocument()
    expect(container.querySelectorAll('.glass-card')).toHaveLength(3)
    expect(screen.getByText('New websites')).toBeInTheDocument()
  })
  it('is anchored at #services', () => {
    const { container } = render(<Services />)
    expect(container.querySelector('section#services')).not.toBeNull()
  })
})
