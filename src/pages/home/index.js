import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { userLoginInfo } from '../../slices/userSlice'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate } from 'react-router-dom'
import Profilebar from '../../components/profilebar'
import Posts from '../../components/posts'
// import { CloseButton } from 'react-toastify/dist/components'

const Home = () => {
  let data = useSelector((state) => state.userLoginInfo.userInfo)
  let dispatch = useDispatch()
  let auth = getAuth()
  let navigate = useNavigate()

  let [verify, setverify] = useState(false)

  useEffect(()=>{
    if(!data){
      navigate('/login')
      console.log(typeof(data))
    }; 
  }, [])

  useEffect(()=>{
    if(data.emailVerified || !data.emailVerified){
      setverify(true)
    }
  }, [])

  onAuthStateChanged(auth, (user) => {
    // if(user.emailVerified){
      dispatch(userLoginInfo(user))
      localStorage.setItem("userInfo", JSON.stringify(user))
      console.log(user)
    // }
    // console.log(user)
    // console.log(user.UserImpl)
    // console.log(user.emailVerified)
  })

  return (
    <div className='md:flex md:justify-center md:gap-x-10 bg-[#F7F9FB] overflow-x-hidden md:overflow-x-visible px-2 md:px-0'>    
      {verify ? 
      (<>
      <div className='relative top-[0px] right-[0px] py-1 md:hidden'>
        <Link to='/profile'><button className='absolute right-0 bg-[#0E6795] font-bold text-white py-[5px] px-3 rounded-md'>profile</button></Link>
      </div>
      
      <div className='w-full md:w-3/5' >
        <Posts />
      </div>
      <div className='w-full md:w-1/5 md:mt-9 absolute md:relative top:0 hidden md:block' >
        {data&&
        <Profilebar />}
      </div>
      </>)
      : (<div className='w-full h-screen flex justify-center items-center bg-[rgba(0,0,0,.75)]'>
          <h1 className='bg-[#0E6795] font-bold text-5xl text-white pt-5 pb-6 px-8'>please verfy your email</h1>
        </div>)
      }
    </div>
  )
}

export default Home