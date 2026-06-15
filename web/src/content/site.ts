import type { NavLink, MarqueeItem } from './types'

export const site = {
  brand: 'DE VILLA DESIGN',
  calendly: 'https://calendly.com/andre-devilladesign/free-20-minute-chat',
  email: 'andre@devilladesign.com',
  nav: [
    { label: 'Services', href: '#services' },
    { label: 'Work', href: '#work' },
    { label: 'Process', href: '#process' },
    { label: 'Contact', href: '#contact' },
  ] as NavLink[],
  marquee: [
    { label: 'Physiotherapy', href: '/demos/serenity-physio/' },
    { label: 'Yoga studios', href: '/demos/bloom-yoga/' },
    { label: 'Dental practices', href: '/demos/coastal-dental/' },
    { label: 'Chiropractic', href: '/demos/truenorth-chiro/' },
    { label: 'Med spas', href: '/demos/lumiere-skin/' },
    { label: 'Pilates', href: '/demos/form-pilates/' },
    { label: 'Massage therapy', href: '/demos/stillpoint-massage/' },
    { label: 'Wellness retreats', href: '/demos/solace-springs/' },
  ] as MarqueeItem[],
  hero: {
    eyebrow: 'WEBSITES FOR HEALTH & WELLNESS · AUSTRALIA',
    titleLead: 'Calm, beautiful websites that ',
    titleAccent: 'fill your books.',
    lead: 'For clinics, studios and practitioners who want to look as good online as the care they give.',
    indexNum: '01',
    categories: 'Dental · Chiro · Med spa / Pilates · Massage · Physio',
    note: 'De Villa builds calm, conversion-ready websites for the people who keep Australia well — your canvas, beautifully done.',
  },
}
