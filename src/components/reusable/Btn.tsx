"use client"

import React from 'react'
import { ArrowRightIcon } from '@phosphor-icons/react'

const Btn = ({value, variant, Icon} : {value: string, variant: string, Icon:any}) => {
  return (
    // <button className={`group flex items-center justify-center gap-x-2 p-3 text-sm tracking-normal border border-cultured rounded-lg bg-gradient-gray text-white font-semibold  transition-all duration-200 cursor-pointer `}>
    //   {value}
    //   <ArrowRightIcon/>
    // </button>
    <div className='flex items-center justify-center mt-8 flex items-center '>
      {/* <div className='p-0.5 font-semibold border-blue-500 border text-white bg-gradient-primary rounded-lg h-11 '>
        <button className='flex items-center justify-center gap-x-2  border-b-2 border-blue-500 rounded-md w-full h-full px-4'>
          <Icon weight='regular' className='text-lg'/>
          <span className='text-sm'>{value}</span>
        </button>
      </div> */}
    </div>
  )
}

export default Btn