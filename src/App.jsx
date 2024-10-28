import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import './App.css'
import Registration from './pages/Registration'
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Home from './pages/Home';
import LoggedInUserRoute from './PrivateRoute/loggedInUserRoute';
import NotLoggedInUserRoute from './PrivateRoute/NotLoggedInUserRoute';
import Message from './pages/Message';
import RootlayOut from './Rootlayout';
import "cropperjs/dist/cropper.css";


function App() {
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route element={<LoggedInUserRoute/>}>
      <Route element={<RootlayOut/>}>
      <Route path='/' element={<Home/>}/>  
      <Route path='/message' element={<Message/>}/>  
      </Route>

      </Route>
      <Route element={<NotLoggedInUserRoute/>}>
      <Route path='/registration' element={<Registration/>}/>
      <Route path='/login' element={<Login/>}/>
      </Route>  
    </Route>
  )
)
  return (
    <>
      <RouterProvider router={router}/>
    </>
  )
}

export default App
