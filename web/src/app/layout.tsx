import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const hanken = localFont({
  src: '../fonts/hanken-grotesk-variable.woff2',
  variable: '--font-hanken',
  weight: '300 800',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://devilladesign.com'),
  title: 'De Villa Design — Websites for Health & Wellness Businesses in Australia',
  description:
    'Calm, beautiful websites for Australian clinics, studios and wellness practitioners. Designed to earn trust and fill your books.',
  alternates: { canonical: 'https://devilladesign.com' },
  openGraph: {
    title: 'De Villa Design — Websites for Health & Wellness',
    description:
      'Calm, beautiful websites for Australian clinics, studios and wellness practitioners.',
    type: 'website',
    url: 'https://devilladesign.com',
    locale: 'en_AU',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath d='M16 3C16 3 7 14.5 7 20.5a9 9 0 0 0 18 0C25 14.5 16 3 16 3Z' fill='%236f95e0'/%3E%3C/svg%3E",
  },
}

export const viewport: Viewport = { themeColor: '#f3f6f9' }

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'De Villa Design',
  description:
    'Web design studio creating websites for health and wellness businesses across Australia.',
  url: 'https://devilladesign.com',
  email: 'andre@devilladesign.com',
  areaServed: { '@type': 'Country', name: 'Australia' },
  knowsAbout: ['Web design', 'Health and wellness websites', 'Small business websites'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script mutates className before hydration;
    // telling React to accept the DOM state rather than error on the mismatch.
    <html lang="en-AU" className={hanken.variable} suppressHydrationWarning>
      <head>
        {/* Runs synchronously during HTML parsing, before first paint —
            adds 'js' class so CSS scroll-animation reveals work correctly.
            Progressive enhancement: without JS the class is absent and
            content stays visible. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
      </body>
    </html>
  )
}
