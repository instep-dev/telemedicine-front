"use client"

import { GlobalStyles } from "@/styles/style"
import Title from "../reusable/Title"
import { starData, testimonialsData } from "@/data/data"
import Image from "next/image"
import { useState } from "react"
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react"

const Testimonials = () => {
  const [showAll, setShowAll] = useState(false)

  const visibleTestimonials = showAll
  ? testimonialsData
  : testimonialsData.slice(0, 6)
  
  return (
    <main className={`${GlobalStyles.mainContainer}`}>
      <div className={`${GlobalStyles.innerContainer}`}>
        <Title
          variant={true}
          subValue={"Patient"}
          value="stories"
          title={"Experiences show real results"}
          desc={
            "How HealthJoy simplifies checkups, reports, and follow-ups while keeping care personal."
          }
        />
        <div className="mt-12 grid grid-cols-3 gap-6 relative">
          <div className={`${showAll ? "-bottom-16 bg-transparent" : "bottom-0 bg-gradient-to-t from-background via-transparent to-transparent"} flex items-end justify-center absolute left-0 right-0 z-10 h-[600px] `}>
            {testimonialsData.length > 6 && (
              <button onClick={()=> setShowAll((prev) => !prev)} className="group flex items-center justify-center gap-x-1 px-4 py-2 rounded-full bg-primary hover:gap-x-3 text-white font-medium hover:bg-primary/70 transition-all duration-200 cursor-pointer">
                {showAll ? "Show less" : "Show more"}
                {showAll ? <CaretUpIcon weight="fill" size={14}/> : <CaretDownIcon weight="fill" size={14}/>}
            </button>
            )}
          </div>
          {visibleTestimonials.map((item, i) => {
            return (
              <div key={i} className="border rounded-3xl border-accent/15 relative p-6 h-[280px] flex flex-col justify-between bg-white">
                <Image src={"/static/Dot.png"} alt="blur" width={400} height={400} className="absolute right-0 top-0" />
                <div className="relative">
                  <div className="flex items-center ">
                    {starData.map((item, i) => {
                      return (
                        <item.icon key={i} size={16} weight='fill' className='text-yellow-500'/>
                      )
                    })}
                  </div>
                  <p className="font-medium text-accent mt-6">{item.desc}</p>
                </div>
                <div className="flex items-center gap-3 relative">
                  <div className="border w-12 h-12 border-3 shadow border-accent/15 rounded-xl overflow-hidden">
                    <Image src={item.image} alt="" width={100} height={100} className="w-full h-full object-cover"/>
                  </div>
                  <div>
                    <h3 className="font-medium tracking-tight">{item.name}</h3>
                    <p className="text-accent text-[12px] font-medium">{item.title}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}

export default Testimonials
