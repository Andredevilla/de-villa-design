import { site } from '@/content/site'
import { GlassButton } from '@/components/ui/GlassButton'

export function Hero() {
  const h = site.hero
  return (
    <section className="hero" id="top">
      <div className="hero-blobs" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="hero-glass" aria-hidden="true" />
      <div className="container-1200 hero-inner">
        <p className="eyebrow">
          <span className="eyebrow-dot" aria-hidden="true" />
          {h.eyebrow}
        </p>
        <h1>
          {h.titleLead}
          <span className="gradient-text">{h.titleAccent}</span>
        </h1>
        <p className="lead">{h.lead}</p>
        <div className="hero-actions">
          <GlassButton href={site.calendly} variant="blue" external>
            Book a free chat
          </GlassButton>
          <GlassButton href="#work" variant="clear">
            See recent work →
          </GlassButton>
        </div>
        <div className="hero-foot">
          <span className="hero-foot-num">{h.indexNum}</span>
          <span className="hero-foot-cats">{h.categories}</span>
          <p className="hero-foot-note">{h.note}</p>
        </div>
      </div>
    </section>
  )
}
