"use client"

import { GlobalStyles } from "@/styles/style"
import Image from "next/image"
import Title from "../reusable/Title"
import LightRays from "../LightRays"
import { CheckCircleIcon, CircleNotchIcon, FileMagnifyingGlassIcon, MicrophoneIcon, PaperPlaneIcon, ThumbsUpIcon, VideoIcon } from "@phosphor-icons/react"
import Arrow from "../reusable/Arrow"

const About = () => {
  return (
    <main className={`${GlobalStyles.mainContainer} relative border-b border-cultured border-dashed`}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full ">
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <LightRays
            raysOrigin="top-center"
            raysColor="#b6b7b7"
            raysSpeed={1}
            lightSpread={0.5}
            rayLength={3}
            followMouse={false}
            mouseInfluence={0}
            noiseAmount={0}
            distortion={0}
            className="custom-rays"
            pulsating={false}
            fadeDistance={1}
            saturation={1}
        />
        </div>
      </div>
      <div className={`${GlobalStyles.innerContainer} relative z-10`}>
        <div className="relative">
          <Title desc="Real feedback from teams who’ve seen big wins and even bigger time savings." variant={false} title="Our tools are built to make your life easier and your audience happier." subValue="Why telemedicine?"/>
          <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 xl:[grid-auto-rows:350px]">
            <div className="min-h-[350px] border border-cultured rounded-xl bg-card flex flex-col justify-between p-6 gap-6">
              <div className="border w-full h-full">
                summary here
              </div>
              <div>
                <h3 className="text-xl">Send at the Perfect Time</h3>
                <p className="font-semibold text-accent mt-2 tracking-tight">Schedule emails to send when your audience is most likely to engage.</p>
              </div>
            </div>
            <div className="min-h-[350px] rounded-xl bg-[#e5c2a7] relative">
              <Image src={'/static/doctor2.png'} alt="" className="absolute left-1/2 -translate-x-1/2 bottom-0" width={280} height={300}/>
              <div className="absolute left-0 right-0 bottom-0 h-full p-6 bg-gradient-to-b from-transparent to-background flex items-end justify-center rounded-md text-center text-2xl">
                Segment audiences based on behavior and preferences
              </div>
            </div>
            <div className="min-h-[700px] rounded-xl border border-cultured bg-card xl:row-span-2 flex flex-col justify-between overflow-hidden relative">
              <div className="absolute inset-0 w-full h-full">
                <Image src={`/static/Grid.png`} width={700} height={700} alt="" className="w-full h-full object-cover"/>
              </div>
                <div
                  className="flex h-full w-full flex-col justify-between will-change-transform py-12 relative"
                  style={{
                    transform: "perspective(200rem) rotateX(30deg) rotateY(-35deg) rotateZ(12deg)",
                    transformOrigin: "top right"
                  }}
                >
                  {/* <div className=" absolute inset-0 bg-gradient-to-b from-background/90 via-transparent to-background/90"/> */}  
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-x-2 border p-2 rounded-lg bg-gradient-gray border border-cultured">
                      <div className='w-5 h-5 text-white rounded-sm border-cultured border bg-red-700 flex items-center justify-center'>
                        <VideoIcon weight="duotone" className="text-sm"/>
                      </div>
                      <p className="text-sm">Consultation</p>
                    </div>
                  </div>
                  <Arrow/>
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-x-2 border p-2 rounded-lg bg-gradient-gray border border-cultured">
                      <div className='w-5 h-5 text-white rounded-sm border-cultured border bg-blue-700 flex items-center justify-center'>
                        <MicrophoneIcon weight="duotone" className="text-sm"/>
                      </div>
                      <p className="text-sm">Real Time Transcript</p>
                    </div>
                  </div>
                  <Arrow/>
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-x-2 text-white border p-2 px-3 rounded-full bg-gradient-primary border border-primary">
                      <CircleNotchIcon className="animate-spin" weight="bold"/>
                      <p className="text-base">Wait, around 15 seconds</p>
                    </div>
                  </div>
                  <Arrow/>
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-x-2 border p-2 rounded-lg bg-gradient-gray border border-cultured">
                      <div className='w-5 h-5 text-white rounded-sm border-cultured border bg-yellow-600 flex items-center justify-center'>
                        <FileMagnifyingGlassIcon weight="duotone" className="text-sm"/>
                      </div>
                      <p className="text-sm">SOAP Generated</p>
                    </div>
                  </div>
                  <Arrow/>
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-x-2 border p-2 rounded-lg bg-gradient-gray border border-cultured">
                      <div className='w-5 h-5 text-white rounded-sm border-cultured border bg-green-700 flex items-center justify-center'>
                        <CheckCircleIcon weight="duotone" className="text-sm"/>
                      </div>
                      <p className="text-sm text-green-600">Succesfull !</p>
                    </div>
                  </div>
                </div>
              <div className="p-6 pt-0">
                <h3 className="text-xl">Streamline Every Step</h3>
                <p className="font-semibold text-accent mt-2 tracking-tight">Automate every patient needed from consultation to SOAP</p>
              </div>
            </div>
            <div className="min-h-[350px] border border-cultured rounded-xl bg-background xl:col-span-2 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-background/50 z-10"/>
              <div className="absolute inset-0">
                <Image src={`/static/videocall.jpg`} width={700} height={700} alt="" className="w-full h-full object-cover"/>
              </div>
              <div className="p-6 w-[300px] h-[250px] relative border border-cultured rounded-xl bg-background relative z-20">
                graph
              </div>
            </div>
            <div className="min-h-[350px] border border-cultured rounded-xl bg-card flex flex-col justify-between p-6 gap-6">
              <div className="border w-full h-full">
                summary here
              </div>
              <div>
                <h3 className="text-xl">Tailor Every Email</h3>
                <p className="font-semibold text-accent mt-2 tracking-tight">Automatically adjust content based on user behavior and preferences.</p>
              </div>
            </div>
            <div className="min-h-[350px] min-h-[350px] border border-cultured rounded-xl bg-card xl:col-span-2 flex flex-col justify-between p-6 overflow-hidden">
              <div className="flex items-center justify-center">
                <Image src={`/static/patient.png`} width={150} height={100} className="blur-3xl -mr-24" alt=""/>
                <Image src={`/static/patient.png`} width={200} height={200} className="relative" alt=""/>
                <Image src={`/static/patient.png`} width={150} height={100} className="blur-3xl -ml-24" alt=""/>
              </div>
              <h3 className="w-md mx-auto text-center text-2xl tracking-tight"><span className="text-accent">Achieve a 25% higher open rate</span> with customized, targeted email campaigns.</h3>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default About

