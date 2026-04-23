import React from 'react'
import { WarningIcon } from '@phosphor-icons/react'

const Notify = ({variant, error, success} : {variant: boolean, error?:string, success?:string}) => {
  return variant ? (
    <div className="flex items-start justify-start gap-x-2 mt-6 p-4 rounded-lg bg-green-500/10 text-green-600 border border-green-950">
      <p className="text-sm">{success}</p>
    </div>
  ) : (
    error ? (
      <div className="flex items-start justify-start gap-x-2 mt-6 p-4 rounded-lg bg-red-500/10 text-red-600 border border-red-950">
        <div className="mt-1">
          <WarningIcon weight="bold" size={14}/>
        </div>
        <p className="text-sm">{error}</p>
      </div>
    ) : null
  )
}

export default Notify