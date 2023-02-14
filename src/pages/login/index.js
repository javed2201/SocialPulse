import React, { useState } from 'react'
import {RiEyeFill, RiEyeCloseFill} from 'react-icons/ri'
import { ToastContainer, toast } from 'react-toastify';
import { Link, useNavigate } from "react-router-dom";
import { Radio, Watch } from  'react-loader-spinner'
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useDispatch } from 'react-redux';
import { userLoginInfo } from '../../slices/userSlice';

const Login = () => {
  const auth = getAuth()
  let navigate = useNavigate()
  let dispatch = useDispatch()

  let [showPassword, setShowPassword] = useState(false)
  let [email, setEmail] = useState("")
  let [password, setPassword] = useState("")
  let [emailErr, setEmailErr] = useState("")
  let [passwordErr, setPasswordErr] = useState("")
  let [logLoading, setLogLoading] = useState(false)
  
  
  let handleEmail = (e) =>{
    setEmail(e.target.value)
    setEmailErr("")
  }

  let handlePassword = (e) =>{
    setPassword(e.target.value)
    setPasswordErr("")
  }

  let handleSubmit = () =>{
    if(!email){
      setEmailErr("* email is required!")
    } else if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
      setEmailErr("* please provide a valid email!")
    }

    if(!password){
      setPasswordErr("* password is required!")
    } 

    if(email && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/.test(email) &&
      password ){
        setLogLoading(true)
        toast.success("successfully loggend in! wait for redirection");
        signInWithEmailAndPassword(auth, email, password)
            .then((user) => {
                console.log(user.user)
                dispatch(userLoginInfo(user.user))
                localStorage.setItem("userInfo", JSON.stringify(user.user));
                setTimeout(()=>{
                  setLogLoading(false);
                  navigate("/");
                },3000);                
            })
            .catch((error) => {
                const errorCode = error.code;
                if (errorCode.includes("auth/user-not-found")){
                    setEmailErr("Email not found")
                }
                if (errorCode.includes("auth/wrong-password")){
                    setPasswordErr("Password not match")
                }
                setLogLoading(false)
            });
      }
  }

  return (
    <div className='flex justify-center'>
          <div className='mt-2 sm:mt-20 overflow-x-hidden'>
                
                <div className='text-center mb-5 sm:mb-10'>
                  <img src='../images/Logo.png' className='mx-auto'></img>
                </div>

                <div className='text-center'>
                  <h3 className='font-nunito font-bold text-4xl text-heading'>Login</h3>
                </div>
                
                <div className='text-center'>
                  <p className='font-nunito font-regular text-xl mt-3.5'>Free register and you can enjoy it</p>
                </div>
                
                <div className='relative w-full sm:w-96 mx-auto mt-16 text-center'>
                  <input onChange={handleEmail} type="email" className='border border-solid border-secondary w-[90%] sm:w-96 py-6 px-14 rounded-lg' value={email} />
                  <p className='font-nunito font-semibold text-sm text-heading absolute top-[-10px] left-[34px] bg-white px-[18px]'>Email Address</p>
                  {emailErr && 
                  <p className='absolute left-[11px] bottom-[-26px] font-nunito font-semibold text-sm text-red-500 w-[90%] sm:w-96 rounded-sm mt-2.5 p-1.5'>{emailErr}</p>
                  }
                </div>

                <div className='relative w-full sm:w-96 mx-auto mt-14 sm:mt-16 text-center'>
                  <input type={showPassword? "text" : "password"} onChange={handlePassword} className='border border-solid border-secondary w-[90%] sm:w-96 py-6 px-14 rounded-lg' value={password} />
                  {showPassword?(
                  <RiEyeCloseFill onClick={()=>setShowPassword(false)}
                  className='absolute top-7 right-8 sm:right-5' />
                  )
                  :(
                  <RiEyeFill onClick={()=>setShowPassword(true)} 
                  className='absolute top-7 right-8 sm:right-5' />
                  )}
                  <p className='font-nunito font-semibold text-sm text-heading absolute top-[-10px] left-[34px] bg-white px-[18px]'>Password</p>
                  {passwordErr && 
                  <p className='absolute left-[11px] bottom-[-26px] font-nunito font-semibold text-sm text-red-500  w-full md:w-96 rounded-sm mt-2.5 p-1.5'>{passwordErr}</p>
                  }
                </div>

                <div className='w-full sm:w-96 mx-auto text-center'>
                  {!logLoading?
                  <button onClick={handleSubmit} className='w-[90%] sm:w-96 bg-[#086FA4] rounded-full font-nunito font-semibold text-xl text-white py-5 mt-16'>Sign In</button>
                  :
                  <div className='relative w-full h-[68px] mt-16'>
                    <div className='absolute top-[0px] left-[152px]'>
                    <Watch
                    height="60"
                    width="60"
                    radius="48"
                    color="#0E6795"
                    ariaLabel="watch-loading"
                    wrapperStyle={{}}
                    wrapperClassName=""
                    visible={true}
                    />
                    </div>
                  </div>
                  }
                </div>
                
                <p className='w-96 text-center font-regular text-sm text-heading mx-auto mt-9 mb-8 sm:mb-20'>Don't have an account ? 
                  <Link to={"/registration"}><span className='font-bold text-open text-[#d63434]'> Sign Up</span></Link> 
                </p>
            </div>
            <ToastContainer position="top-right" theme="dark" />
    </div>
  )
}

export default Login