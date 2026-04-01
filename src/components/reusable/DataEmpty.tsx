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
    <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500 flex items-center justify-center">
      <div className="border rounded-xl text-xs bg-white border border-gray-200 p-6 text-gray-500">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center  border border-gray-200 mx-auto mb-1 ${ItemIcon === CircleNotchIcon ? "bg-gray-100 " : ""} ${ItemIcon === XIcon ? "bg-red-100" : ""} `}>
          <ItemIcon className={`${ItemIcon === CircleNotchIcon ? "animate-spin text-gray-600 " : ""} ${ItemIcon === XIcon ? "text-red-600 " : ""} mx-auto text-[10px] `}  weight="bold"/>
      </div>
        <p className="max-w-28 mx-auto text-center">
          <span className="font-semibold text-gray-600">{value}</span> {subValue}
        </p>
      </div>
  </div>
  )
}

export default DataEmpty
