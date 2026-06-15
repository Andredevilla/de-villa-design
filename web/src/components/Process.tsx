import { process } from '@/content/process'
import { SectionHead } from '@/components/ui/SectionHead'
import { GlassCard } from '@/components/ui/GlassCard'
import { IridescentOrb } from '@/components/ui/IridescentOrb'

export function Process() {
  return (
    <section className="section" id="process">
      <div className="container-1200">
        <SectionHead
          eyebrow="HOW IT WORKS"
          title="A simple, calm process"
          lead="No jargon, no surprises — you'll know exactly where things stand at every step."
        />
        <div className="grid-4">
          {process.map((s) => (
            <GlassCard key={s.num}>
              <IridescentOrb size={40} className="orb-num">
                {s.num}
              </IridescentOrb>
              <h3 style={{ marginTop: 16 }}>{s.title}</h3>
              <p>{s.body}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}
