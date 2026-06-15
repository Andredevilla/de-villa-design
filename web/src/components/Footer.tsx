import { site } from '@/content/site'
import { IridescentOrb } from '@/components/ui/IridescentOrb'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-1200 footer-inner">
        <span className="footer-brand">
          <IridescentOrb size={22} /> {site.brand}
        </span>
        <span>Websites for health &amp; wellness · Australia</span>
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </div>
    </footer>
  )
}
