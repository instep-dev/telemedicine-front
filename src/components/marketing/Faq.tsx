"use client"

import { GlobalStyles } from "@/styles/style"
import Title from "../reusable/Title"
import { PhoneCallIcon, WhatsappLogoIcon } from "@phosphor-icons/react"
import Image from "next/image"
import { faqData } from "@/data/data"
import { useState } from "react"

const Faq = () => {
  const [showAnswer, setShowAnswer] = useState<number[]>([])

  const toggleFaq = (index: number) => {
    setShowAnswer((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index]
    )
  }

  return (
    <main className={`${GlobalStyles.mainContainer}`}>
      <div className={`${GlobalStyles.innerContainer} grid grid-cols-3 gap-12`}>
        <div className="col-span-1 ">
          <div className="border border-accent/15 w-full rounded-3xl p-6 bg-primary relative overflow-hidden sticky top-20">
            <Image src={"/Dots.png"} alt="blur" width={400} height={400} className="absolute z-0 left-0 right-0 -bottom-4" />
            <div className="w-12 h-12 bg-[#7fc8c2] group-hover:bg-white transition-all duration-200 rounded-full flex items-center justify-center relative">
              <PhoneCallIcon size={22} weight="fill" className="text-white group-hover:text-primary transition-all duration-200" />
            </div>
            <h3 className="mt-10 text-white font-medium text-3xl tracking-tight">Still not sure? Book a free discovery call now.</h3>
            <button className="relative text-sm group flex w-full mt-12 items-center justify-center gap-x-1 px-4 py-3 rounded-full bg-white text-black font-medium hover:bg-[#7fc8c2] hover:text-white transition-all duration-200 cursor-pointer">
              <WhatsappLogoIcon size={16} weight="fill" className="text-primary group-hover:text-white transition-all duration-200" />
              Whatsapp
            </button>
            <p className="text-center text-white font-medium mt-4">telemedicine@example.com</p>
          </div>
        </div>

        <div className="col-span-2">
          <Title
            variant={false}
            subValue={"Frequently"}
            value="provide to you"
            title={"Answers to your asked queries"}
            desc={""}
          />

          <div className="mt-10 grid grid-cols-1 gap-6">
            {faqData.map((item, i) => {
              const isOpen = showAnswer.includes(i)

              return (
                <div key={i} className="border-b border-accent/15 pb-12 cursor-pointer">
                  <div className="flex items-center justify-between" onClick={() => toggleFaq(i)}>
                    <h3 className="font-medium tracking-tight text-xl">{item.question}</h3>

                    <button className={`relative cursor-pointer w-6 h-6 rounded-full  ${isOpen ? "bg-white" : "bg-primary"} border border-accent/15  transition-all duration-200 flex items-center justify-center`}>
                      <div className={`${isOpen ? "opacity-0" : "opacity-100"} w-[9px] h-[1.5px] bg-white absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 transition-all duration-200`} />
                      <div className={`${isOpen ? "rotate-180 bg-black" : "rotate-90 bg-white"} w-[9px] h-[1.5px]  absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 transition-all duration-200`} />
                    </button>
                  </div>

                  <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-40 mt-4 opacity-100" : "max-h-0 opacity-0"}`}>
                    <p className="font-medium text-accent w-[90%]">{item.answer}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}

export default Faq