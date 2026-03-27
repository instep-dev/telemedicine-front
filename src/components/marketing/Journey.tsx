"use client"

import { GlobalStyles } from '@/styles/style'
import Title from '../reusable/Title'
import { leftPanelData, rightPanelData } from '@/data/data'
import { CheckIcon, ArrowRightIcon } from '@phosphor-icons/react'
import Image from 'next/image'

const LeftPanel = () => {
  return (
    <div className='border border-accent/15 bg-white p-8 rounded-3xl relative overflow-hidden group cursor-pointer'>
      <Image src={"/static/Dot.png"} alt="blur" width={400} height={400} className="absolute z-0 right-0 top-0" />
      <MiniTitle title='Tracking simplified' desc='Track consultations & test results' />
      <div className='mt-10 h-[270px] flex items-start gap-x-8 relative'>
        <div className='w-[1px] h-[80%] bg-accent/15 ml-2 relative mt-1'>
          <div className='group-hover:bg-primary w-4 h-4 bg-[#ebf7f4] transition-all duration-500 rounded-full absolute left-1/2 top-0 -translate-x-1/2 flex items-center justify-center'>
            <CheckIcon size={9} className='text-white' weight='bold'/>
          </div>
          <div className='group-hover:bg-primary w-4 h-4 bg-[#ebf7f4] transition-all duration-500 rounded-full absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center'>
            <CheckIcon size={9} className='text-white' weight='bold'/>
          </div>
          <div className='w-4 h-4 bg-primary rounded-full absolute left-1/2 bottom-0 -translate-x-1/2 flex items-center justify-center'>
            <CheckIcon size={9} className='text-white' weight='bold'/>
          </div>
        </div>
        <div className='w-full h-full grid grid-cols-1'>
          {leftPanelData.map((item, i) => {
            return (
              <div key={i} className={`flex items-start justify-between ${i === 0 ? "mt-0" : "mt-6"}`}>
                <div>
                  <h3 className="font-medium tracking-tight">{item.title}</h3>
                  <p className="text-accent text-[12px] font-semibold">{item.date}</p>
                </div>
                {i === leftPanelData.length - 1 ? (
                  <div className='flex items-center'>
                    {(item.image ?? [])
                      .filter((img): img is string => typeof img === "string")
                      .map((item, i) => {
                      return (
                        <Image key={i} width={50} height={50} alt='' className={`border rounded-xl border-3 border-white ${i === 0 ? "ml-0 -rotate-6" : "-ml-4 -rotate-6"}`} src={item}/>
                      )
                    })}
                  </div>
                ) : (
                  <div className='px-2 py-1 border rounded-full bg-primary text-white border-accent/20 text-[10px] mt-2 font-medium tracking-normal'>
                    {item.value}+
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const MidPanel = () => {
  return (
    <div className='border border-accent/15 bg-white p-8 rounded-3xl relative overflow-hidden group cursor-pointer'>
      <Image src={"/static/Dot.png"} alt="blur" width={400} height={400} className="absolute z-0 right-0 top-0" />
      <MiniTitle title='Instant support' desc='Connect with doctors quick anytime' />
      <div className='mt-10 h-[270px] flex flex-col justify-between relative'>
        <div className='flex justify-end items-center'>
          <div className='rounded-b-2xl rounded-tl-2xl border border-accent/15 py-2 px-3 bg-[#f7f7f7] text-accent text-[13px] font-medium'>
            Hi, It's me Dr. Chandler what can i help? 👋
          </div>
        </div>
        <p className='text-[10px] text-center text-accent font-medium'>Today 23:59 AM</p>
        <div className='flex justify-start items-center'>
          <div className='rounded-b-2xl bg-primary rounded-tr-2xl border border-accent/15 py-2 px-3 bg-[#f7f7f7] text-white text-[13px] font-medium'>
            I’ve been feeling chest pain for the last two days, especially when I walk or climb stairs, I don't know what to do
          </div>
        </div>
        <div className='flex justify-end items-center'>
          <div className='rounded-b-2xl rounded-tl-2xl border border-accent/15 py-2 px-3 bg-[#f7f7f7] text-accent text-[13px] font-medium'>
            Okay, we’ll guide you 🙏
          </div>
        </div>
        <div className='flex justify-start items-center'>
          <div className='rounded-b-2xl bg-primary rounded-tr-2xl border border-accent/15 py-2 px-3 bg-[#f7f7f7] text-white text-[13px] font-medium relative'>
            Thank you so much 💘!
            <div className='w-5 h-5 rounded-full bg-white border border-accent/15 flex items-center justify-center absolute -bottom-3 left-2 shadow text-[10px]'>
              👍
            </div>
          </div>
        </div>
        <div className='text-center text-[12px] group-hover:block hidden transition-all duration-500'>
          •••
        </div>
      </div>
    </div>
  )
}

const RightPanel = () => {
  const rightPanelImages = rightPanelData
    .filter((item): item is { image: string } => typeof item.image === "string")
    .slice(0, 2);

  return (
    <div className='border border-accent/15 bg-white p-8 rounded-3xl relative overflow-hidden group cursor-pointer'>
      <Image src={"/static/Dot.png"} alt="blur" width={400} height={400} className="absolute z-0 right-0 top-0" />
      <MiniTitle title='1-1 Consultation' desc='Doctors through video consultations' />
      <div className='mt-10 h-[270px] flex flex-col justify-between relative'>
        <div className='flex items-center justify-center relative'>
          {rightPanelImages.map((item, i) => {
            return (
              <Image key={i} src={item.image} alt='' width={220} height={200} className={`${i === 0 ? "z-10 rotate-12 group-hover:z-0" : "z-0 -rotate-3 group-hover:z-10" } absolute left-1/2 -translate-x-1/2 top-6 border-6 border-white rounded-2xl transition-all duration-400`}/>
            )
          })}
        </div>
        <div className='flex items-center justify-between gap-3'>
          {(rightPanelData.find((item) => item.button)?.button ?? []).map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className={`${i === 2 ? "w-11 h-11 bg-primary group-hover:scale-115 transition-all duration-400" : ''} w-10 h-10 rounded-full border border-accent/15 flex items-center justify-center text-accent`}>
                <Icon size={16} weight={`${i === 2 ? "fill" : 'bold'}`} className={`${i === 2 ? "text-white group-hover:-rotate-45 transition-all duration-400" : ''}`} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const MiniTitle = ({title, desc} : {title:string, desc:string}) => {
  return (
    <div className=''>
      <h3 className="text-xl font-medium tracking-tight mb-1">{title}</h3>
      <p className="text-accent font-medium">{desc}</p>
    </div>
  )
}

const Journey = () => {
  return (
    <main className={`${GlobalStyles.mainContainer}`}>
      <div className={GlobalStyles.innerContainer}>
        <Title
          variant={true}
          subValue={"Patient"}
          value="journey"
          title={"Every care story, every moment"}
          desc={
            "From first consultation to treatment and follow-up, we make every step of the patient journey."
          }
        />
        <div className='max-w-6xl mt-12 grid grid-cols-3 gap-6'>
          <LeftPanel/>
          <MidPanel/>
          <RightPanel/>
        </div>
        <div className='flex items-center justify-center gap-x-2 mt-6'>
          <p className='text-accent font-medium'>1 - 1 Consultations</p>
          <div className='w-5 h-5 rounded-full bg-primary flex items-center justify-center'>
            <ArrowRightIcon size={12} className='text-white'/>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Journey
