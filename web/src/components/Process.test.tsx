import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Process } from './Process'

describe('Process', () => {
  it('renders 4 steps with plain black step numbers (no orb disk)', () => {
    const { container } = render(<Process />)
    expect(container.querySelector('section#process')).not.toBeNull()
    expect(container.querySelectorAll('.glass-card')).toHaveLength(4)
    expect(container.querySelectorAll('.step-num')).toHaveLength(4)
    expect(container.querySelector('.orb')).toBeNull()
    expect(screen.getByText('Chat')).toBeInTheDocument()
    expect(screen.getByText('Launch')).toBeInTheDocument()
  })
})
