import React from "react";

import Image from "next/image";
import { PhoneCallIcon, WhatsappLogoIcon } from "@phosphor-icons/react";

export default function SidebarWidget() {
  return (
    <div className="col-span-1">
      <div className="border border-cultured w-full rounded-lg p-4 bg-card relative overflow-hidden sticky top-20">
        <div className="w-8 h-8 bg-gradient-gray transition-all duration-200 rounded-full flex items-center justify-center relative">
          <PhoneCallIcon size={16} weight="duotone" className="text-white group-hover:text-primary transition-all duration-200" />
        </div>
        <h3 className="mt-4 text-white font-medium text-lg tracking-tight leading-tight">Contact our admin via Whatsapp!</h3>
        <button className="relative text-xs group flex w-full mt-12 items-center justify-center gap-x-1 px-2 py-2 rounded-lg bg-green-400/10 border border-green-900 text-black font-medium  text-white transition-all duration-200 cursor-pointer">
          <WhatsappLogoIcon size={14} weight="duotone" className="text-green-400  transition-all duration-200" />
          Whatsapp
        </button>
        <p className="text-center text-xs text-white font-medium mt-2">telemedicine@example.com</p>
      </div>
    </div>
  );
}
