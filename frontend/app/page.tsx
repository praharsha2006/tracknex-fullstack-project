import Faq from '@/components/Faq'
import Features from '@/components/Features'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'

export default function Home() {
  return (
    <main>
      <Hero />
      <Features/>
      <Faq/>
      <Footer/>
      {/* other sections here */}
    </main>
  )
}
