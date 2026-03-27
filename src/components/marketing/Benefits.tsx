"use client"

import { GlobalStyles } from "@/styles/style"
import Title from "../reusable/Title"
import { benefitsData } from "@/data/data"
import { ArrowRightIcon } from "@phosphor-icons/react"
import Image from "next/image"


const RightPanel = () => (
  <div className="h-full min-h-[420px] rounded-3xl bg-primary p-8 text-white relative overflow-hidden group cursor-pointer">
    <Image src={"/static/Dots.png"} alt="blur" width={400} height={400} className="absolute z-0 left-0 right-0 -bottom-4" />
    <Image src={"/static/doctor1.png"} alt="blur" width={700} height={250} className="absolute z-10 left-1/2 -translate-x-1/2 -bottom-28 group-hover:scale-105 transition-all duration-200" />
    <div className="w-10 h-10 bg-[#7fc8c2] group-hover:bg-white transition-all duration-200 rounded-lg flex items-center justify-center relative">
      <ArrowRightIcon size={16} weight="bold" className="text-white group-hover:text-primary transition-all duration-200"/>
    </div>
    <h3 className="text-2xl font-medium tracking-tight mt-6 mb-2">Ready for better care?</h3>
    <p className="text-white/70 font-medium">Advanced treatments powered by modern technology and experts</p>
  </div>
)

const BenefitCard = ({ title, desc, icon: Icon }: { title: string; desc: string, icon:any }) => {
  return (
    <div className="rounded-3xl border border-accent/15 p-6 relative overflow-hidden bg-white">
      <Image src={"/static/Dot.png"} alt="blur" width={400} height={400} className="absolute right-0 top-0" />
      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center" >
        <Icon size={17} weight="bold" className="text-white"/>
      </div>
      <h3 className="text-xl font-medium tracking-tight mt-6 mb-2">{title}</h3>
      <p className="text-accent font-medium">{desc}</p>
    </div>
  )
}

const Benefits = () => {
  return (
    <main className={GlobalStyles.mainContainer}>
      <div className={GlobalStyles.innerContainer}>
        <Title
          variant={true}
          subValue={"What we"}
          value="provide to you"
          title={"What Healthjoy actually means"}
          desc={
            "From online consultations to lab tests & prescriptions, we bring complete care closer to every patient."
          }
        />
        <section className="mt-12 grid gap-6 lg:grid-cols-3">
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-2">
            {benefitsData.map((item, i) => (
              <BenefitCard key={i} icon={item.icon} title={item.title} desc={item.desc} />
            ))}
          </div>
          <div className="lg:sticky lg:top-24">
            <RightPanel />
          </div>
        </section>
      </div>
    </main>
  )
}

export default Benefits
