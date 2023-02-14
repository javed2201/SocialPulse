import React, { useState } from 'react'
import {RiEyeFill, RiEyeCloseFill} from 'react-icons/ri'
import { ToastContainer, toast } from 'react-toastify';
import { Link, useNavigate } from "react-router-dom";
import { Radio, Watch } from  'react-loader-spinner'
import { getDatabase, ref, set } from "firebase/database";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";

const Ragistration = () => {
  const auth = getAuth();
  const db = getDatabase();
  let navigate = useNavigate()

  let [showPassword, setShowPassword] = useState(false)
  let [email, setEmail] = useState("")
  let [fullName, setFullName] = useState("")
  let [password, setPassword] = useState("")
  let [emailErr, setEmailErr] = useState("")
  let [fullNameErr, setFullNameErr] = useState("")
  let [passwordErr, setPasswordErr] = useState("")
  let [regLoading, setRegLoading] = useState(false)
  

  let handleEmail = (e) =>{
    setEmail(e.target.value)
    setEmailErr("")
  }

  let handleFullName = (e) =>{
    setFullName(e.target.value)
    setFullNameErr("")
  }

  let handlePassword = (e) =>{
    setPassword(e.target.value)
    setPasswordErr("")
  }

  let handleSubmit = () =>{
    if(!email){
      setEmailErr("* email is required!")
    } else if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/.test(email)){
      setEmailErr("* please provide a valid email!")
    }

    if(!fullName){
      setFullNameErr("* full name is required!")
    }

    if(!password){
      setPasswordErr("* password is required!")
    } 
    /* 
    else if(!/^(?=.*[a-z])/.test(password)){
      setPasswordErr("* lowercase is required!")
    } else if(!/^(?=.*[A-Z])/.test(password)){
      setPasswordErr("* uppercase is required!")
    } else if(!/^(?=.*[1-9])/.test(password)){
      setPasswordErr("* number is required!")
    } else if(!/^(?=.*[!@#$%^&*`])/.test(password)){
      setPasswordErr("* symbol is required!")
    } else if(!/^(?=.{7,})/.test(password)){
      setPasswordErr("* password must be greater than 6 characters!")
    }
    */

    if(email && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/.test(email) &&
      fullName &&
      password 
      // && /^(?=.*\d)(?=.*[!@#$%^&*`])(?=.*[a-z])(?=.*[A-Z])(?=.*[1-9]).{8,}$/.test(password)
      ){
        setRegLoading(true)
        createUserWithEmailAndPassword(auth, email, password).then((user)=>{
          console.log(auth.currentUser)
          updateProfile(auth.currentUser, {
            displayName: fullName, 
            photoURL: "images/Logo.png",
          })
          .then(() => {
            toast.success("successfully registered! please verify your email");
            setEmail("")
            setFullName("")
            setPassword("")
            sendEmailVerification(auth.currentUser)
            setTimeout(()=>{
              setRegLoading(false)
              navigate("/login")
            }, 4000)
          })
          .then(() => {
            set(ref(db, 'users/' + user.user.uid), {
              username: user.user.displayName,
              email: user.user.email,
            });
          })          
        }).catch((error)=>{
          if (error.code.includes("auth/email-already-in-use")) {
              setEmailErr("Emaiil already in use!")
              setRegLoading(false)
          }
        })
      }
  }

  return (
    <div className='flex justify-center'>
          <div className='mt-2 sm:mt-20 overflow-x-hidden'>
                
                <div className='text-center mb-5 sm:mb-10'>
                  <img src='../images/Logo.png' className='mx-auto'></img>
                </div>

                <div className='text-center'>
                  <h3 className='font-nunito font-bold text-[23px] sm:text-4xl text-heading'>Get started with easily register</h3>
                </div>
                
                <div className='text-center'>
                  <p className='font-nunito font-regular text-xl mt-2 sm:mt-3.5'>Free register and you can enjoy it</p>
                </div>
                
                <div className='relative w-full sm:w-96 mx-auto mt-14 sm:mt-16 text-center'>
                  <input onChange={handleEmail} type="email" value={email} className='border border-solid border-secondary w-[90%] sm:w-96 py-6 px-14 rounded-lg' />
                  <p className='font-nunito font-semibold text-sm text-heading absolute top-[-10px] left-[34px] bg-white px-[18px]'>Email Address</p>
                  {emailErr && 
                  <p className='absolute left-[11px] bottom-[-26px] font-nunito font-semibold text-sm text-red-500 w-[90%] sm:w-96 rounded-sm mt-2.5 p-1.5'>{emailErr}</p>
                  }
                </div>

                <div className='relative w-full sm:w-96 mx-auto mt-6 sm:mt-16 text-center'>
                  <input onChange={handleFullName} type="text" value={fullName} className='border border-solid border-secondary w-[90%] sm:w-96 py-6 px-14 rounded-lg' />
                  <p className='font-nunito font-semibold text-sm text-heading absolute top-[-10px] left-[34px] bg-white px-[18px]'>Full Name</p>
                  {fullNameErr && 
                  <p className='absolute left-[11px] bottom-[-26px] font-nunito font-semibold text-sm text-red-500 w-96 rounded-sm mt-2.5 p-1.5'>{fullNameErr}</p>
                  }
                </div>

                <div className='relative w-full sm:w-96 mx-auto mt-6 sm:mt-16 text-center'>
                  <input type={showPassword? "text" : "password"} value={password} onChange={handlePassword} className='border border-solid border-secondary w-[90%] sm:w-96 py-6 px-14 rounded-lg' autoComplete="new-password" />
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

                <div className=' w-full sm:w-96 mx-auto text-center '>
                  {!regLoading?
                  <button onClick={handleSubmit} className='w-[90%] sm:w-96 bg-[#086FA4] rounded-full font-nunito font-semibold text-xl text-white py-5 mt-10 sm:mt-16'>Sign up</button>
                  :
                  <div className='relative w-full h-[68px] mt-10 sm:mt-16'>
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
                
                <p className='w-96 text-center font-regular text-sm text-heading mx-auto mt-9 mb-8 sm:mb-20'>Already have an account ? 
                  <Link to={"/login"}><span className='font-bold text-open text-[#d63434]'> Sign In</span></Link> 
                </p>
          </div>
          <ToastContainer position="top-right" theme="dark" />
    </div>
  )
}

export default Ragistration