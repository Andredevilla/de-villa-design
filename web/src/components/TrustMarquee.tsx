import { site } from '@/content/site'

function Copy({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="marquee-copy" aria-hidden={hidden || undefined}>
      {site.marquee.map((m) => (
        <span key={m.href} style={{ display: 'inline-flex', gap: 22, alignItems: 'center' }}>
          <a href={m.href} tabIndex={hidden ? -1 : undefined}>
            {m.label}
          </a>
          <span className="dot">·</span>
        </span>
      ))}
    </div>
  )
}

export function TrustMarquee() {
  return (
    <section className="trust" aria-label="Explore demo sites by industry">
      <div className="marquee">
        <div className="marquee-track">
          <Copy />
          <Copy hidden />
        </div>
      </div>
    </section>
  )
}
