import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { WhatIsCliqtree } from "@/components/what-is-cliqtree"
import { HowItWorks } from "@/components/how-it-works"
import { BenefitsSection } from "@/components/benefits-section"
import { Testimonials } from "@/components/testimonials"
import { PricingSection } from "@/components/pricing-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <WhatIsCliqtree />
        <HowItWorks />
        <BenefitsSection />
        {/*<Testimonials />
         <PricingSection /> */} 
      </main>
      <Footer />
    </div>
  )
}
