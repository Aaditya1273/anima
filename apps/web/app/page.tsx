import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Hero } from '@/components/sections/Hero'
import { Section2 } from '@/components/sections/Section2'
import { Section3 } from '@/components/sections/Section3'
import { Section4 } from '@/components/sections/Section4'

export const metadata = {
  title: 'anima · programmable confidential finance',
  description:
    'FHE-powered payroll, compliant token shielding, and confidential distributions on Ethereum Sepolia. Balances and transfer amounts stay encrypted on-chain.',
}

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[var(--color-cream)] text-[var(--color-ink)]">
      <Navbar />
      <Hero />
      <Section2 />
      <Section3 />
      <Section4 />
      <Footer />
    </main>
  )
}
