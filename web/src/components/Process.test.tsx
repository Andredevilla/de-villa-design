import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Process } from './Process'

describe('Process', () => {
  it('renders 4 steps with numbered orbs', () => {
    const { container } = render(<Process />)
    expect(container.querySelector('section#process')).not.toBeNull()
    expect(container.querySelectorAll('.glass-card')).toHaveLength(4)
    expect(screen.getByText('Chat')).toBeInTheDocument()
    expect(screen.getByText('Launch')).toBeInTheDocument()
  })
})
