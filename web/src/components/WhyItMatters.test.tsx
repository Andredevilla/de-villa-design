import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { WhyItMatters } from './WhyItMatters'

describe('WhyItMatters', () => {
  it('renders the heading and the three benefit titles', () => {
    render(<WhyItMatters />)
    expect(screen.getByRole('heading', { level: 2, name: /More than pretty/ })).toBeInTheDocument()
    expect(screen.getByText('Booking built in')).toBeInTheDocument()
    expect(screen.getByText('Designed to earn trust')).toBeInTheDocument()
    expect(screen.getByText('Found on Google')).toBeInTheDocument()
  })
  it('renders an icon tile per benefit', () => {
    const { container } = render(<WhyItMatters />)
    expect(container.querySelectorAll('.icon-tile')).toHaveLength(3)
  })
})
