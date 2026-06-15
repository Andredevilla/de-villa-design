import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Home from './page'

describe('Home page', () => {
  it('renders exactly one H1', () => {
    render(<Home />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })
  it('renders all four anchored sections', () => {
    const { container } = render(<Home />)
    for (const id of ['services', 'work', 'process', 'contact']) {
      expect(container.querySelector(`section#${id}`)).not.toBeNull()
    }
  })
})
