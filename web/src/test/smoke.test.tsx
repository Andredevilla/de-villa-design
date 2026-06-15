import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

function Hello() {
  return <p>harness ok</p>
}

describe('test harness', () => {
  it('renders a component in jsdom', () => {
    render(<Hello />)
    expect(screen.getByText('harness ok')).toBeInTheDocument()
  })
})
