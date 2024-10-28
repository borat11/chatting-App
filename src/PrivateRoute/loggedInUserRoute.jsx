import { useSelector } from "react-redux"
import { Outlet } from "react-router-dom"
import Login from "../pages/Login"

export default function loggedInUserRoute() {
    const user = useSelector((user)=>user.login.loggedIn)
    return user ? <Outlet/>:<Login/>
}