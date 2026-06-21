import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SelectedWork } from './SelectedWork'
import { work } from '@/content/work'

describe('SelectedWork', () => {
  it('renders 11 cards linking to the real demos with screenshots', () => {
    const { container } = render(<SelectedWork />)
    const cards = container.querySelectorAll('a.work-card')
    expect(cards).toHaveLength(11)
    work.forEach((w, i) => {
      const card = cards[i] as HTMLAnchorElement
      expect(card).toHaveAttribute('href', w.href)
      expect(card.querySelector('img')).toHaveAttribute('src', w.shot)
      expect(card.querySelector('img')).toHaveAttribute('alt', w.alt)
    })
  })
  it('has a Browse-all CTA to /demos/', () => {
    render(<SelectedWork />)
    expect(screen.getByRole('link', { name: /Browse all eleven demos/ })).toHaveAttribute('href', '/demos/')
  })
})
