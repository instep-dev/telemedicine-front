"use client"

import React from 'react'
import { DatabaseIcon } from '@phosphor-icons/react'

const DataEmpty = ({value, subValue} : {value: string, subValue:string}) => {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500 flex items-center justify-center">
      <div className="border rounded-xl text-xs bg-white border border-gray-200 p-6 text-gray-500 ">
      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 border border-gray-200 mx-auto mb-1">
          <DatabaseIcon className="mx-auto text-[10px]" weight="fill"/>
      </div>
        <p className="max-w-24 mx-auto text-center">
          <span className="font-medium text-gray-600">{value}</span> {subValue}
        </p>
      </div>
  </div>
  )
}

export default DataEmpty
