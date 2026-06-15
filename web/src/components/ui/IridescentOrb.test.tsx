import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { IridescentOrb } from './IridescentOrb'
import { GlassCard } from './GlassCard'

describe('IridescentOrb', () => {
  it('renders a number child', () => {
    render(<IridescentOrb size={40}>{3}</IridescentOrb>)
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})

describe('GlassCard', () => {
  it('renders children inside a .glass-card', () => {
    const { container } = render(<GlassCard><span>hi</span></GlassCard>)
    expect(container.querySelector('.glass-card')).not.toBeNull()
    expect(screen.getByText('hi')).toBeInTheDocument()
  })
})
