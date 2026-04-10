"use client"

const Title = ({title, variant,  subValue, desc} : { subValue:string, variant: boolean, title: string, desc: string}) => {
  return (
    <div className="">
      <div className="flex items-center justify-center">
        <div className="py-1.5 px-2 rounded-md bg-gradient-gray border border-cultured text-sm">
          {subValue}
        </div>
      </div>
      <h1 className={`text-center ${variant ? "w-lg" : "w-xl"}  text-5xl font-serif mt-6 mx-auto`}>
        {title}
      </h1>
      {variant ? (
        <p className={`mt-6 text-center ${variant ? "w-sm" : "w-md"} mx-auto font-semibold text-accent text-[20px]`}>
          {desc}
        </p>
      ) : null }
    </div>
  )
}

export default Title