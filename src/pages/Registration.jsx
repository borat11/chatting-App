import React from 'react'
import RegFromCom from '../components/Registration'
import Lottie from "lottie-react";
import registrationAnimation from "../animations/registration-animation.json"
import { ToastContainer, toast } from 'react-toastify';
import { TalkNest } from '../svg/TalkNest';


const Registration = () => {
  return (
    <>
    <ToastContainer />
    <div className="flex items-center justify-center h-screen bg-gray-100 p-4">
      <div className="flex flex-col items-center bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-3xl border-t-4 border-b-4 border-blue-600">
        <div className="w-full py-6 flex items-center justify-center bg-blue-50">
          <h1 className="text-3xl font-semibold text-blue-700">
            <TalkNest />
          </h1>
        </div>
        <div className="flex w-full p-6 gap-4">
          <div className="w-1/2 flex items-center justify-center">
            <Lottie animationData={registrationAnimation} loop={true} className="max-w-xs" />
          </div>
          <div className="w-1/2">
            <RegFromCom toast={toast} />
          </div>
        </div>
      </div>
    </div>
  </>
)
}

export default Registration