/**
 * Home Page
 * Landing page showcasing the Tech Interview Platform
 */

import HeroSection from '../components/HeroSection'
import TracksSection from '../components/TracksSection'
import PracticeModesSection from '../components/PracticeModesSection'
import CTASection from '../components/CTASection'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main>
        <HeroSection />
        <TracksSection />
        <PracticeModesSection />
        <CTASection />
      </main>
    </div>
  )
}
