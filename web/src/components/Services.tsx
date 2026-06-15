import { services } from '@/content/services'
import { SectionHead } from '@/components/ui/SectionHead'
import { GlassCard } from '@/components/ui/GlassCard'

export function Services() {
  return (
    <section className="section section-services" id="services">
      <div className="container-1200">
        <SectionHead
          eyebrow="SERVICES"
          title="What I can do for you"
          lead="I specialise in websites for health & wellness businesses — so yours converts from day one."
        />
        <div className="grid-3">
          {services.map((s) => (
            <GlassCard key={s.num}>
              <div className="card-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}
