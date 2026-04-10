"use client"

import Hero from '@/components/marketing/Hero'
import About from '@/components/marketing/About'
import Benefits from '@/components/marketing/Benefits'
import Journey from '@/components/marketing/Journey'
import Struggle from '@/components/marketing/Struggle'
import Solutions from '@/components/marketing/Solutions'
import Testimonials from '@/components/marketing/Testimonials'
import Faq from '@/components/marketing/Faq'
import Cta from '@/components/marketing/Cta'


const Home = () => {
  return (
    <>
      <Hero/>
      <About/>
      {/* <Benefits/> */}
      <Journey/>
      {/* <Struggle/> */}
      {/* <Solutions/> */}
      <Testimonials/>
      {/* <Faq/> */}
      <Cta/>
    </>
  )
}

export default Home