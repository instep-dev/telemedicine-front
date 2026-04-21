"use client"

import Image from 'next/image'
import { MagicWandIcon, MicrophoneIcon, RobotIcon, VideoIcon  } from '@phosphor-icons/react'

const heroData = [
  {
    icon: RobotIcon,
    title: "Automate AI SOAP Summary"
  },
  {
    icon: MicrophoneIcon,
    title: "Realtime transcript"
  },
  {
    icon: VideoIcon,
    title: "Online video consultation"
  },
]

const Hero = () => {
  return (
    <main className='min-h-screen relative overflow-hidden border-b border-cultured border-dashed'>
      <div className='z-20 w-full h-48 absolute bottom-0 flex items-end pb-6 justify-center bg-gradient-to-b from-transparent via-background to-background '>
        <div className="flex items-center gap-12 justify-center">
          {heroData.map((item, i) => {
            return (
              <div key={i} className='flex items-center gap-2'>
                <div className='w-9 h-9 rounded-md border-cultured border bg-gradient-gray flex items-center justify-center'>
                  <item.icon/>
                </div>
                <p className='text-sm'>{item.title}</p>
              </div>
            )
          })}
        </div>
      </div>
      <div className='absolute inset-0 z-0'>
        <Image
          src={'/static/bg1.png'}
          alt=''
          fill
          sizes='100vw'
          className='object-cover object-top'
        />
        <div className='absolute inset-0 bg-background/90'/>
        <div className='absolute top-0 left-0 w-full h-[100vh] bg-gradient-to-b from-background via-background to-transparent'/>
      </div>

      <div className='relative z-10 w-[1152px] mx-auto pt-42 relative '>
        <div className='bottom-1/7 -left-20 bg-gradient-to-b from-white via-blue-500 to-red-500 absolute w-72 h-72 z-0 rounded-full blur-[150px]'/>
        <div className='bottom-1/7 -right-20 bg-gradient-to-b from-white via-red-500 to-blue-500 absolute w-72 h-72 z-0 rounded-full blur-[150px]'/>
        <div className='text-center text-7xl font-serif'>
          <h3>The only cold outreach</h3>
          <h3>tool you'll ever need</h3>
        </div>
        <div className='text-center w-lg mx-auto text-xl font-semibold mt-4 text-accent'>
          Streamlined automation and real-time insights to supercharge your cold outreach efforts.
        </div>
        <div className='flex items-center justify-center mt-8 flex items-center '>
          <div className='p-0.5 w-xs font-semibold border-blue-500 border text-white bg-gradient-primary rounded-lg h-11 '>
            <button className='flex items-center justify-center gap-x-2  border-b-2 border-blue-500 rounded-md w-full h-full'>
              <MagicWandIcon weight='regular' className='text-lg'/>
              <span className='text-sm'>Get Started for Free</span>
            </button>
          </div>
        </div>
        <div className='flex items-center justify-center mt-6 gap-x-2'>
          <div className='flex items-center'>
            <div className='w-8 h-8 rounded-md border bg-neutral-500 -rotate-12'/>
            <div className='w-8 h-8 rounded-md border bg-neutral-500 -ml-2 -rotate-6'/>
            <div className='w-8 h-8 rounded-md border bg-neutral-500 -ml-2 -rotate-3'/>
          </div>
          <p className='text-sm font-medium'>5000+ Happy users</p>
        </div>
        <div className='mt-20 w-full relative h-screen rounded-lg border border-cultured bg-background/50 p-2'>
          <div className='flex items-center gap-x-1.5 ml-1'>
            <div className='w-2 h-2 rounded-full bg-red-900'/>
            <div className='w-2 h-2 rounded-full bg-yellow-900'/>
            <div className='w-2 h-2 rounded-full bg-green-900'/>
          </div>
          <div className='w-full h-full border-cultured border bg-background mt-2 rounded-lg'>
            hero hre
          </div>
        </div>
      </div>
    </main>
  )
}

export default Hero
