import React from 'react'
import Navbar from '../components/Navbar/Navbar'
import { Outlet } from 'react-router-dom'

const RootlayOut = () => {
  return (
    <>
   <div className='relative w-full h-screen'>
      <div className='h-[600px] bg-black w-full flex items-center justify-between'>
        <div className='w-3/4  h-[800px] bg-white shadow-lg rounded-md absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex' >
        <Navbar/>   
        <Outlet/>
        </div>
      </div>
    </div>
    </>
  )
}

export default RootlayOut 