import { Nav } from '@/components/Nav'
import { Hero } from '@/components/Hero'
import { TrustMarquee } from '@/components/TrustMarquee'
import { Services } from '@/components/Services'
import { SelectedWork } from '@/components/SelectedWork'
import { WhyItMatters } from '@/components/WhyItMatters'
import { Process } from '@/components/Process'
import { Contact } from '@/components/Contact'
import { Footer } from '@/components/Footer'
import { Reveal } from '@/components/ui/Reveal'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <TrustMarquee />
        <Reveal>
          <Services />
        </Reveal>
        <Reveal>
          <SelectedWork />
        </Reveal>
        <Reveal>
          <WhyItMatters />
        </Reveal>
        <Reveal>
          <Process />
        </Reveal>
        <Reveal>
          <Contact />
        </Reveal>
      </main>
      <Footer />
    </>
  )
}
