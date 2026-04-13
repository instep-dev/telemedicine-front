"use client"

import { GlobalStyles } from "@/styles/style"
import Title from "../reusable/Title"
import { testimonialsData } from "@/data/data"
import CircularGallery from "../CircularGallery"

import Btn from "../reusable/Btn"
import { ChartBarIcon } from "@phosphor-icons/react"
import Grid from "../reusable/Grid"

const Testimonials = () => {
  const galleryItems = testimonialsData.map((item) => ({
    image: item.image,
    text: item.desc,
    meta: {
      name: item.name,
      title: item.title,
    },
  }))

  return (
    <main className={`${GlobalStyles.mainContainer} pb-0 border-b border-cultured relative border-dashed`}>
      <div className={`${GlobalStyles.innerContainer} relative`}>
        <Grid/>
        <div className="relative">
          <Title
            variant={true}
            subValue={"Testimonials"}
            title={"Why people can’t stop talking about Telemedicine"}
            desc={
              "Real feedback from teams who've seen big wins and even bigger time savings."
            }
          />
          <div className="flex items-center justify-center">
            <Btn value={"Explore Dashboard"} variant={""} Icon={ChartBarIcon}/>
          </div>
        </div>
      </div>
      <div className="relative -mt-24" style={{ height: '600px' }}>
        <CircularGallery
          items={galleryItems}
          bend={4}
          textColor="#ffffff"
          borderRadius={0.05}
          showText={false}
          renderMode="text"
          showCanvas={false}
          scrollSpeed={2}
          scrollEase={0.09}
        />
      </div>
    </main>
  )
}

export default Testimonials
