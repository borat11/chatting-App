import { FriendsIcon } from '../../svg/Friends'
import { MessageIcon } from '../../svg/Message'
import { LogoutIcon } from '../../svg/Logout'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getAuth, signOut } from "firebase/auth";
import { useDispatch, useSelector } from 'react-redux'
import { loggedOutUsers } from '../../features/slice/LoginSlice'
import { CameraIcon } from '../../svg/Camera';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import Modals from '../Modals';


const Navbar = () => {
  const user = useSelector((user)=>user.login.loggedIn)

  const [show,setShow] = useState(false)
  const location =useLocation()
  const auth = getAuth();
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleLogOut=()=>{
    signOut(auth).then(() => {
      navigate('/login')
      localStorage.removeItem('user')
      dispatch(loggedOutUsers())
    }).catch((error) => {
      console.log(error)
    })
  }

  return (
    <>
    <div className="flex h-screen md:h-[800px]">
      <div className="flex flex-col items-center justify-between py-3 bg-slate-900 px-5 w-16 md:w-52">
        <div className="flex flex-col items-center gap-y-4">
          <div className="relative">
            <div className="w-10 h-10 md:w-16 md:h-16 rounded-full overflow-hidden">
              <img
                src={user.photoURL || "https://i.ibb.co/ng7V1Vr/avater.jpg"}
                className="w-full h-full object-cover"
              />
            </div>
            <div
              onClick={() => setShow(true)}
              className="absolute bottom-0 right-0 w-4 h-4 md:w-5 md:h-5 bg-white rounded-full flex items-center justify-center cursor-pointer"
            >
              <CameraIcon />
            </div>
          </div>
          <div className="font-mono text-white text-sm md:text-2xl text-center">
            <span>{user.displayName}</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-y-4">
          <Link
            to="/"
            className={`${
              location.pathname === "/"
                ? "text-white bg-[#6CD0FB]"
                : "text-[#292D32] bg-white"
            } w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center`}
          >
            <FriendsIcon />
          </Link>

          <Link
            to="/message"
            className={`${
              location.pathname === "/message"
                ? "text-white bg-[#6CD0FB]"
                : "text-[#292D32] bg-white"
            } w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center`}
          >
            <MessageIcon />
          </Link>
        </div>

        <div className="text-white mt-4 hidden md:block">
          <button
            className="flex justify-between items-center text-xl md:text-3xl"
            onClick={handleLogOut}
          >
            <LogoutIcon /> <p className="ml-2">Log Out</p>
          </button>
        </div>
        <div className="text-white mt-4 block md:hidden">
          <button onClick={handleLogOut}>
            <LogoutIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
    {
      show && createPortal(
        <Modals setShow={setShow}/>,
        document.body
      )
    }
    </>
  )
}

export default Navbar;
