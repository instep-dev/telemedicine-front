"use client"

import { GlobalStyles } from "@/styles/style"
import { contactData, socmedData } from "@/data/data"
import { navLinks } from "@/data/data"
import Image from "next/image"
import { FlowerLotusIcon } from "@phosphor-icons/react/dist/ssr"
import { DevToLogoIcon } from "@phosphor-icons/react"

const Footer = () => {
  return (
    <footer className={`${GlobalStyles.mainContainer}`}>
      <div className={`${GlobalStyles.innerContainer} `}>
        <div className="flex items-center justify-between border-b border-accent/15 pb-12">
          <div>
            <div className="flex text-2xl font-medium tracking-tight items-start">
              Telemedicine
              <p className="text-base font-light">®</p>
            </div>
            <p className="text-accent font-medium mt-1">Framer template for Healthcare</p>
          </div>
          <div className="flex items-center justify-end gap-2">
            {socmedData.map((item, i) => {
              return (
                <div key={i} className={`${i === 0 ? "px-4" : ""} p-3 bg-white rounded-full border border-accent/15 flex items-center justify-center gap-x-2`}>
                  <item.icon weight="fill" size={16} className="text-primary"/>
                  {i === 0 ? (
                    <p className="text-accent text-sm font-medium">Copy Email</p>
                  ): null}
                </div>
              )
            })}
          </div>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-64 border-b border-accent/15 pb-12">
          <div className="">
            <div className="flex items-center gap-x-2 text-2xl font-medium tracking-tight">
               <h3 className="">Subscribe to our newsletter</h3>
               <Image src={'https://cdn.shopify.com/s/files/1/1061/1924/products/High_Five_Emoji_ios10_dbf898f9-7c80-4ed4-b8c6-d8db45401eb8_70x70.png?v=1511943147'} width={20} height={20} alt=""/>
               <p>!</p>
            </div>
            <p className="text-accent font-medium mt-1">Stay updated with fresh ideas</p>
            <div className="mt-6">
              <div className="relative overflow-hidden">
                <input placeholder="your email" className="relative text-black font-medium w-full pl-6 p-3 rounded-full bg-white border border-accent/15 placeholder:capitalize placeholder:font-medium placeholder:text-accent"/>
                <Image src={"/static/Dot.png"} alt="blur" width={400} height={400} className="absolute z-0 right-0 top-0" />
              </div>
              <button className="flex items-center justify-center w-full p-3 bg-primary text-white rounded-full mt-4 font-medium">
                Get Started
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="">
              <h3 className="font-medium tracking-tight text-lg">Navigation:</h3>
              <div className="mt-6 grid grid-cols-1 gap-6">
                {navLinks.map((item, i) => {
                  return (
                    <div key={i} className="flex items-center gap-x-4 cursor-pointer group">
                      <p className="text-[12px] text-primary font-medium">0{i + 1}•</p>
                      <div className="text-accent font-medium ">
                        <p>{item.title}</p>
                        <div className="w-[1%] opacity-0 h-[1.5px] group-hover:w-[100%] group-hover:opacity-100 transition-all duration-400 bg-primary rounded-full mt-1"/>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="">
              <h3 className="font-medium tracking-tight text-lg">Navigation:</h3>
              <div className="mt-6 grid grid-cols-1 gap-6">
                {contactData.map((item, i) => {
                  return (
                    <div key={i} className="flex items-center gap-x-4 cursor-pointer group">
                      <p className="text-[12px] text-primary font-medium">0{i + 1}•</p>
                      <div className="text-accent font-medium ">
                        <p>{item.title}</p>
                        <div className="w-[1%] opacity-0 h-[1.5px] group-hover:w-[100%] group-hover:opacity-100 transition-all duration-400 bg-primary rounded-full mt-1"/>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 flex items-center justify-between">
          <div className="flex items-center gap-x-2 text-accent font-medium">
            <p>Copyright © Telemedicine 2026</p>  
            <p className="text-primary">•</p>
            <p>Jakarta, Indonesia</p>
          </div>
          <div className="flex items-center gap-x-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <DevToLogoIcon size={16} weight="fill" className="text-white"/>
            </div>
            <p className="text-accent font-medium">By Moefaris</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
