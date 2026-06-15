import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SectionHead } from './SectionHead'

describe('SectionHead', () => {
  it('renders eyebrow, title and lead', () => {
    render(<SectionHead eyebrow="SERVICES" title="What I can do for you" lead="Lead copy." />)
    expect(screen.getByText('SERVICES')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'What I can do for you' })).toBeInTheDocument()
    expect(screen.getByText('Lead copy.')).toBeInTheDocument()
  })
  it('omits the lead when not provided', () => {
    const { container } = render(<SectionHead eyebrow="X" title="Y" />)
    expect(container.querySelectorAll('p')).toHaveLength(1)
  })
})
