"use client"

import Image from 'next/image'
import { FirstAidIcon } from '@phosphor-icons/react'
import Btn from '../reusable/Btn'
import { starData, heroData } from '@/data/data'
import { WaveformIcon, SealCheckIcon } from '@phosphor-icons/react'
import { Fragment } from 'react/jsx-runtime'

const Hero = () => {
  return (
    <main className='w-full min-h-screen pt-20 pb-20 relative relative'>
      <Image src={`/static/bg.png`} width={200} height={200} className=' w-full h-full absolute inset-0' alt=''/>
      <div className='max-w-6xl mx-auto h-[600px] relative z-10 grid grid-cols-2 '>
        <div className='flex items-center justify-start'>
          <div className=''>
            <div className='flex items-center gap-x-2'>
              <div className='w-4 h-4 bg-primary rounded-full flex items-center justify-center'>
                <FirstAidIcon size={8} className='text-white' weight='fill'/>
              </div>
              <p className='flex items-center gap-x-1 font-medium text-accent'>Telemedicine <span className='text-black'>your healthcare partner</span></p>
            </div>
            <div className='text-[50px] font-semibold leading-14 mt-6 tracking-tight'>
              <h1>Access healthcare</h1>
              <h1>without leaving home</h1>
            </div>
            <p className='mt-6 font-medium text-accent text-lg'>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione architecto aspernatur temporibus.
            </p>
            <div className='mt-8 flex items-center justify-start gap-x-5'>
              <Btn value={`Jump To Call`} variant='primary'/>
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
            </div>
            <div className='mt-24 flex flex justify-between items-center'>
              {heroData.map((item, i) => {
                const color = [
                  'bg-blue-500',
                  'bg-red-500',
                  'bg-green-500',
                ]
                return (
                  <Fragment key={i}>
                    {i === 0 ? null : (
                      <div className='w-[3px] h-[3px] bg-black rounded-full'/>
                    )}
                    <div className='' key={i}>
                      <div className='flex items-start gap-x-2'>
                        <h3 className='text-2xl font-semibold tracking-tight'>{item.value}</h3>
                        <div className={`w-4 h-4 ${color[i]} rounded-full flex items-center justify-center`}>
                          <item.icon size={`${i === heroData.length -1 ? 10 : 8}`} className='text-white' weight={`${i === heroData.length - 2 ? "fill" : "bold"}`}/>
                        </div>
                      </div>
                      <p className='text-accent font-medium'>{item.desc}</p>
                    </div>
                  </Fragment> 
                )
              })}
            </div>
          </div>
        </div>
        <div className='flex items-center justify-end'>
          <div className='w-[75%] h-full rounded-2xl relative shadow-2xl '>
            <div className="absolute top-4 left-4 z-10 flex items-center gap-x-2">
              <div className="w-9 h-9 border-3 shadow border-accent/15 rounded-full overflow-hidden">
                <Image src={'/static/doctor2.jpeg'} alt="" width={100} height={100} className="w-full h-full object-cover object-top"/>
              </div>
              <p className="text-white font-medium ">Dr. Sara Safari</p>
              <SealCheckIcon size={16} weight="fill" className="text-blue-500 -ml-1"/>
            </div>
            <div className='absolute z-20 -bottom-4 left-1/2 -translate-x-1/2 bg-primary w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg'>
              <WaveformIcon size={24} className='text-white rotate-180' weight='regular'/>
            </div>
            <Image src={"https://images.pexels.com/photos/8376309/pexels-photo-8376309.jpeg"} alt='' width={700} height={100} className='w-full h-full object-cover rounded-xl absolute inset-0 '/>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Hero
