import React from 'react';
import Lottie from 'lottie-react';
import LoginAnimation from '../animations/login-animation.json';
import { ToastContainer, toast } from 'react-toastify';
import LoginFormCom from '../components/login';
import { TalkNest } from '../svg/TalkNest'; // Adjust the import path if necessary

const Login = () => {
  return (
    <>
      <ToastContainer />
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="flex flex-col md:flex-row items-center bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-3xl border-t-4 border-b-4 border-blue-600">
          <div className="w-full md:w-full py-6 flex items-center justify-center bg-blue-50">
            <h1 className="text-2xl md:text-3xl font-semibold text-blue-700">
              <TalkNest />
            </h1>
          </div>
          <div className="flex flex-col md:flex-row w-full p-6 gap-4">
            <div className="w-full md:w-1/2 flex items-center justify-center">
              <Lottie animationData={LoginAnimation} loop={true} className="max-w-xs md:max-w-sm" />
            </div>
            <div className="w-full md:w-1/2">
              <LoginFormCom toast={toast} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
