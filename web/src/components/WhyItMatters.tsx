import { whys } from '@/content/whys'
import { SectionHead } from '@/components/ui/SectionHead'
import { CalendarCheck, ShieldCheck, Search, type LucideIcon } from 'lucide-react'

const icons: Record<string, LucideIcon> = {
  booking: CalendarCheck,
  trust: ShieldCheck,
  google: Search,
}

export function WhyItMatters() {
  return (
    <section className="section">
      <div className="container-1200">
        <SectionHead eyebrow="WHY IT MATTERS" title="More than pretty — built to grow your practice" />
        <div className="grid-3">
          {whys.map((w) => {
            const Icon = icons[w.icon]
            return (
              <div key={w.title} className="why">
                <span className="icon-tile">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h3>{w.title}</h3>
                <p>{w.body}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
