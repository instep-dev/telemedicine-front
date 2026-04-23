import React from 'react'
import LoginCard from '@/components/reusable/LoginCard'


const AuthLayout = ({children} : {children:React.ReactNode}) => {
  return (
    <main className='grid grid-cols-2 p-2 min-h-screen'>
      {children}
      <LoginCard/>
    </main>
  )
}

export default AuthLayout
