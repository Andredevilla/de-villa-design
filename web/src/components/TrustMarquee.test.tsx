import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TrustMarquee } from './TrustMarquee'

describe('TrustMarquee', () => {
  it('links the first industry to its demo', () => {
    render(<TrustMarquee />)
    const link = screen.getAllByRole('link', { name: 'Physiotherapy' })[0]
    expect(link).toHaveAttribute('href', '/demos/serenity-physio/')
  })
})
