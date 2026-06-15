import { site } from '@/content/site'
import { GlassButton } from '@/components/ui/GlassButton'

export function Contact() {
  return (
    <section className="section section-contact" id="contact">
      <div className="container-1200">
        <div className="contact-panel">
          <div className="contact-blob contact-blob-a" aria-hidden="true" />
          <div className="contact-blob contact-blob-b" aria-hidden="true" />
          <div className="section-head">
            <p className="eyebrow">GET STARTED</p>
            <h2 className="h2-contact">
              Ready for a website you&rsquo;re <span className="gradient-text">proud of?</span>
            </h2>
            <p>
              A free 20-minute chat about your goals. No pressure, no jargon. Pick any time that suits — it
              shows in your timezone.
            </p>
          </div>
          <GlassButton href={site.calendly} variant="solid" external className="btn-book">
            Book a call
          </GlassButton>
          <p className="contact-alt">
            Prefer email? <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
          <p className="contact-alt">
            You&rsquo;ll be talking directly with Andre — the designer behind De Villa. Replies within one
            business day.
          </p>
        </div>
      </div>
    </section>
  )
}
