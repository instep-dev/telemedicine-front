"use client"

import { GlobalStyles } from "@/styles/style"
import { ctaData, starData } from "@/data/data"
import Btn from "../reusable/Btn"
import Image from "next/image"
import { SealCheckIcon, WaveformIcon } from "@phosphor-icons/react"

const Cta = () => {
  return (
    <main className={`${GlobalStyles.mainContainer}`}>
      <div className={`${GlobalStyles.innerContainer}`}>
        <div className='flex items-center justify-center gap-x-3'>
          <div className='flex items-center justify-start'>
            {starData.map((item, i) => {
              return (
                <item.icon key={i} size={18} weight='fill' className='text-yellow-500'/>
              )
            })}
          </div>
          <p className='font-medium'>5/5 (1,641)</p>
        </div>
        <h3 className="mt-6 text-center max-w-md mx-auto text-[42px] leading-12 font-semibold tracking-tight">Better healthcare from you is one step away</h3>
        <p className={`mt-6 text-center text-accent font-medium max-w-md mx-auto`}>
          Sign up with HealthJoy and connect instantly with doctors, reports, and wellness support.
        </p>
        <div className="flex items-center justify-center mt-6">
          {/* <Btn value={`Jump To Call`} variant='primary'/> */}
        </div>
        <div className=" mt-20 h-[500px] grid grid-cols-3 gap-6 relative">
          <div className="bottom-0 bg-gradient-to-t from-background via-transparent to-transparent flex items-end justify-center absolute left-0 right-0 z-20 h-full">
            <div className='absolute z-20 -bottom-4 left-1/2 -translate-x-1/2 bg-primary w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg'>
              <WaveformIcon size={24} className='text-white rotate-180' weight='regular'/>
            </div>
          </div>
          {ctaData.map((item, i) => {
            return (
              <div key={i} className="flex items-end">
                <div className={`w-full ${i === ctaData.length - 2 ? "h-full" : "h-[90%]"} p-1 bg-white rounded-3xl border border-accent/15`}>
                  <div className='bg-neutral-400 h-full w-full rounded-3xl relative'>
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-x-2">
                      <div className="w-9 h-9 border-3 shadow border-accent/15 rounded-full overflow-hidden">
                        <Image src={item.image} alt="" width={100} height={100} className="w-full h-full object-cover object-top"/>
                      </div>
                      <p className="text-white font-medium ">{item.name}</p>
                      {item.verify ? <SealCheckIcon size={16} weight="fill" className="text-blue-500 -ml-1"/> : null}
                    </div>
                    <Image src={item.image} alt="" width={400} height={100} className='w-full h-full object-cover object-top rounded-xl absolute inset-0 '/>
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

export default Cta