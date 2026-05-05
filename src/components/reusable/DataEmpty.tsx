"use client";

import { CircleNotchIcon, DatabaseIcon, XIcon } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

const DataEmpty = ({
  value,
  subValue,
  ItemIcon = DatabaseIcon,
}: {
  value: string
  subValue: string
  ItemIcon?: Icon
}) => {

  return (
    <div className="mt-4 rounded-lg border border-dashed border-cultured bg-gradient-card py-4 text-sm text-white flex items-center justify-center">
      <div className="border rounded-lg text-xs bg-card border-cultured p-4 text-white">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center border border-cultured mx-auto mb-1 ${ItemIcon === CircleNotchIcon ? "bg-card" : ""} ${ItemIcon === XIcon ? "bg-red-100" : ""} `}>
          <ItemIcon className={`${ItemIcon === CircleNotchIcon ? "animate-spin text-gray-600 " : ""} ${ItemIcon === XIcon ? "text-red-600 " : ""} mx-auto text-[10px] `}  weight="bold"/>
      </div>
        <p className="max-w-28 mx-auto text-center text-neutral-500">
          <span className="">{value}</span> {subValue}
        </p>
      </div>
  </div>
  )
}

export default DataEmpty
