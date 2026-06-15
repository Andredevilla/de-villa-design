import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Reveal } from './Reveal'

describe('Reveal', () => {
  it('always renders its children (content is never lost)', () => {
    render(<Reveal><p>visible content</p></Reveal>)
    expect(screen.getByText('visible content')).toBeInTheDocument()
  })
  it('wraps children in a .reveal element', () => {
    const { container } = render(<Reveal><span>x</span></Reveal>)
    expect(container.querySelector('.reveal')).not.toBeNull()
  })
})
