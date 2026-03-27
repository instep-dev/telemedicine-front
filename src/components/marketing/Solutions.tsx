"use client"

import { GlobalStyles } from "@/styles/style"
import Title from "../reusable/Title"
import Image from "next/image"
import { solutionsData } from "@/data/data"
import { CheckIcon } from "@phosphor-icons/react"

const Solutions = () => {
  return (
    <main className={`${GlobalStyles.mainContainer}`}>
      <div className={`${GlobalStyles.innerContainer} grid grid-cols-2 gap-12`}>
        <div className="">
          <Title
            variant={false}
            subValue={"We Provide"}
            value="solutions"
            title={"Making each step of care simple for your health"}
            desc={
              "Long waiting times, limited access to specialists, and unclear reports often leave patients."
            }
          />
          <div className="mt-7 grid grid-cols-1">
            {solutionsData.map((item, i) => {
              return (
                <div key={i} className="flex items-center gap-x-3 mt-4">
                  <div className='w-4 h-4 bg-primary rounded-full flex items-center justify-center'>
                    <CheckIcon size={9} className='text-white' weight='bold'/>
                  </div>
                  <p className="text-accent font-medium">{item.title}</p>
                </div>
              )
            })}
          </div>
        </div>
        <div className=" relative ">
          {/* <Image src={"/Dot.png"} alt="blur" width={400} height={400} className="absolute z-0 right-0 top-0" />
          <Image src={"/Dot.png"} alt="blur" width={400} height={400} className="absolute z-0 left-0 bottom-0 rotate-180" /> */}
          <div className="text-2xl font-medium tracking-tight leading-10 relative"> 
            <div className="flex items-end gap-x-2">
              <div className="w-10 h-10 rounded-lg bg-neutral-400 rotate-6">
              </div>
              <h3>With years of trusted medical experience,</h3>
            </div>
            <h3>our team works closely <span className="text-accent">with patients to make this</span></h3>
            <h3 className="text-accent">healthcare simple and clear.</h3>
          </div>
          <div className="text-2xl font-medium tracking-tight leading-10 mt-10 relative">
            <h3>Quality care takes consistency and patience. By </h3>
            <h3>staying connected <span className="text-accent">every day, patients achieve</span> </h3>
            <h3 className="text-accent">better outcomes that last.</h3>
          </div>
          <div className="text-2xl font-medium tracking-tight leading-10 mt-10 relative">
            <h3>We believe in reducing stress, improving access, </h3>
            <h3>and creating a <span className="text-accent">smoother journey so every patient </span> </h3>
            <h3 className="text-accent">feels supported.</h3>
          </div>
          <div className="mt-10 text-white flex items-center gap-x-6 p-8 rounded-2xl bg-primary relative overflow-hidden"> 
            <Image src={"/static/Dots.png"} alt="blur" width={400} height={400} className="absolute z-0 left-0 right-0 -bottom-4" />
            <Image src={"/static/doctor2.png"} alt="blur" width={100} height={100} className="absolute z-10 right-2 -bottom-12 group-hover:scale-105 transition-all duration-200" />
            <h3 className="text-5xl font-semibold tracking-tight">92%</h3>
            <div className="font-medium">
              <p>Patients reported faster access & improved </p>
              <p>satisfaction when using Healthjoy.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Solutions
