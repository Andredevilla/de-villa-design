'use client'
import { useState } from 'react'
import { site } from '@/content/site'
import { IridescentOrb } from '@/components/ui/IridescentOrb'
import { GlassButton } from '@/components/ui/GlassButton'

export function Nav() {
  const [open, setOpen] = useState(false)
  return (
    <header className="site-header">
      <div className="container-1200 nav-pill">
        <a className="brand" href="#top" onClick={() => setOpen(false)}>
          <IridescentOrb size={26} />
          <span>{site.brand}</span>
        </a>
        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav id="site-nav" aria-label="Main" className={open ? 'site-nav open' : 'site-nav'}>
          {site.nav.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <GlassButton href={site.calendly} variant="solid" external>
            Book a free chat
          </GlassButton>
        </nav>
      </div>
    </header>
  )
}
