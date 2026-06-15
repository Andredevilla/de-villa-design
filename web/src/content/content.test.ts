import { describe, it, expect } from 'vitest'
import { site } from './site'
import { services } from './services'
import { work } from './work'
import { whys } from './whys'
import { process } from './process'

describe('content config', () => {
  it('has the four nav links', () => {
    expect(site.nav.map((n) => n.href)).toEqual(['#services', '#work', '#process', '#contact'])
  })
  it('uses the real Calendly URL', () => {
    expect(site.calendly).toMatch(/^https:\/\/calendly\.com\//)
  })
  it('has exactly 3 services numbered 01-03', () => {
    expect(services).toHaveLength(3)
    expect(services.map((s) => s.num)).toEqual(['01', '02', '03'])
  })
  it('has exactly 8 work items with valid demo links and shots', () => {
    expect(work).toHaveLength(8)
    for (const w of work) {
      expect(w.href).toMatch(/^\/demos\/[a-z-]+\/$/)
      expect(w.shot).toMatch(/^\/work\/[a-z-]+\.webp$/)
      expect(w.alt.length).toBeGreaterThan(0)
    }
  })
  it('has 3 whys and 4 process steps', () => {
    expect(whys).toHaveLength(3)
    expect(process.map((p) => p.num)).toEqual([1, 2, 3, 4])
  })
})
