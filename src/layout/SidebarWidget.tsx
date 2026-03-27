import React from "react";

import Image from "next/image";
import { PhoneCallIcon, WhatsappLogoIcon } from "@phosphor-icons/react";

export default function SidebarWidget() {
  return (
    <div className="col-span-1">
      <div className="border border-accent/15 w-full rounded-xl p-4 bg-primary relative overflow-hidden sticky top-20">
        <Image src={"/static/Dots.png"} alt="blur" width={400} height={400} className="absolute z-0 left-0 right-0 -bottom-4" />
        <div className="w-6 h-6 bg-white group-hover:bg-white transition-all duration-200 rounded-full flex items-center justify-center relative">
          <PhoneCallIcon size={12} weight="fill" className="text-primary group-hover:text-primary transition-all duration-200" />
        </div>
        <h3 className="mt-6 text-white font-medium text-xl tracking-tight">Contact our admin via Whatsapp!</h3>
        <button className="relative border border-primary hover:border-white text-[12px] group flex w-full mt-6 items-center justify-center gap-x-1 px-2 py-2 rounded-full bg-white text-black font-medium hover:bg-primary hover:text-white transition-all duration-200 cursor-pointer">
          <WhatsappLogoIcon size={14} weight="fill" className="text-green-400 group-hover:text-white transition-all duration-200" />
          Whatsapp
        </button>
        <p className="text-center text-sm text-white font-medium mt-2">telemedicine@example.com</p>
      </div>
    </div>
  );
}
