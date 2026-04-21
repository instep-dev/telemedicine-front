"use client"

import { FirstAidIcon, } from '@phosphor-icons/react'

const LoginCard = () => {
  return (
    <div className='w-full h-full rounded-3xl bg-gradient-primary flex flex-col justify-between p-10 relative overflow-hidden'>
      <div className='w-72 h-72 p-2 border-4 border-accent/10 rounded-full absolute -top-20 -right-20'>
        <div className='w-full h-full border-4 border-accent/10 rounded-full p-2'>
          <div className='w-full h-full border-4 border-accent/10 rounded-full p-2'>
            <div className='w-full h-full border-4 border-accent/10 rounded-full p-2'>
            </div>
          </div>
        </div>
      </div>
      <div className='w-72 h-72 p-2 border-4 border-accent/10 rounded-full absolute -bottom-20 -left-20'>
        <div className='w-full h-full border-4 border-accent/10 rounded-full p-2'>
          <div className='w-full h-full border-4 border-accent/10 rounded-full p-2'>
            <div className='w-full h-full border-4 border-accent/10 rounded-full p-2'>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className='flex items-center gap-x-2'>
          <FirstAidIcon className='text-2xl' weight='fill'/>
          <h3 className='mt-2 mb-1 text-2xl'>Telemedicine ®</h3>
        </div>
        <p className='text-sm '>Consultation. AI Summary.</p>
      </div>
      <div className='flex items-center justify-between gap-6'>
        <div>
          <h3>Ready to launch?</h3>
          <p className='text-sm text-accent'>Clone the repo, install dependencies, and your dashboard is live in minutes.</p>
        </div>
        <div className='w-[1px] h-full bg-accent'/>
        <div>
          <h3>Ready to launch?</h3>
          <p className='text-sm text-accent'>Clone the repo, install dependencies, and your dashboard is live in minutes.</p>
        </div>
      </div>
    </div>
  )
}

export default LoginCard
