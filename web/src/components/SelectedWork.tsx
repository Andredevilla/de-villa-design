import { work } from '@/content/work'
import { SectionHead } from '@/components/ui/SectionHead'
import { GlassButton } from '@/components/ui/GlassButton'

export function SelectedWork() {
  return (
    <section className="section" id="work">
      <div className="container-1200">
        <SectionHead
          eyebrow="SELECTED WORK"
          title="See the standard for yourself"
          lead="Eight complete concept sites I designed and built — open one and explore exactly what I'd build for a business like yours."
        />
        <p className="work-cta">
          <GlassButton href="/demos/" variant="clear">
            Browse all eight demos →
          </GlassButton>
        </p>
        <div className="work-grid">
          {work.map((w) => (
            <a key={w.href} className="work-card" href={w.href}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="work-shot" src={w.shot} alt={w.alt} width={800} height={600} loading="lazy" />
              <div className="work-meta">
                <span className="work-name">{w.name} ↗</span>
                <span className="work-cat">{w.category}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
