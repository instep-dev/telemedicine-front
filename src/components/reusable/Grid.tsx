import React from 'react'

import Image from "next/image"

const Grid = () => {
  return (
    <div className="absolute left-1/2 top-12 -translate-x-1/2 w-4xl h-[250px]">
    <div className="relative w-full h-full">
    <Image src={'/static/Grid.avif'} width={300} height={300} alt="" className="w-full h-full object-fit"/>
    <div className="bg-gradient-to-b from-background via-background/90 to-background absolute inset-0"/>
    </div>  
    </div>
  )
}

export default Grid
