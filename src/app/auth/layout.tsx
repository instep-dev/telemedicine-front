import React from 'react'
import LoginCard from '@/components/reusable/LoginCard'


const AuthLayout = ({children} : {children:React.ReactNode}) => {
  return (
    <main className='grid grid-cols-1 lg:grid-cols-2 p-2 min-h-screen'>
      {children}
      <div className="hidden lg:block">
        <LoginCard />
      </div>
    </main>
  )
}

export default AuthLayout
