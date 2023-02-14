import React, { useState, useRef, useEffect, } from 'react'
import {AiOutlineEdit} from "react-icons/ai"
import { useDispatch, useSelector } from 'react-redux'
import { getDatabase, ref, set, push, onValue, update } from "firebase/database";
import { userLoginInfo } from '../../slices/userSlice';
import { Link } from 'react-router-dom';

const ContactInfoPage = () => {
  let data = useSelector((state) => state.userLoginInfo.userInfo)  
  let db = getDatabase()

  let [phoneUpdate, setPhoneUpdate] = useState(false)
  let [showNewPhone, setShowNewPhone] = useState("")
  let [newPhoneErr, setNewPhoneErr] = useState("") 

  let [addressUpdate, setAddressUpdate] = useState(false)
  let [showNewAddress, setShowNewAddress] = useState("")
  let [newAddressErr, setNewAddressErr] = useState("") 


  useEffect(()=>{
    onValue(ref(db, 'users'), (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
          if(item.key == data.uid){
              arr.push(item.val());
              setShowNewPhone(item.val().phone)
              setShowNewAddress(item.val().address)
          }
      });
    });
  }, [])

  let handlePhoneUpdate = () => {
    if(!newPhone ){
      setNewPhoneErr("* please write a valid phone number")
    } else {
      update(ref(db, "users/" + data.uid), {
        phone: newPhone }
        ).then(()=>{
        setPhoneUpdate(false)
        setNewPhone("")  
        })  
    }
  }
  let handleAddressUpdate = () => {
    if(!newaddress ){
      setNewAddressErr("* please write a valid address")
    } else {
      update(ref(db, "users/" + data.uid), {
        address: newaddress }
        ).then(()=>{
        setAddressUpdate(false)
        setNewaddress("")  
        })  
    }
  }
let [newPhone, setNewPhone] = useState(showNewPhone)
let [newaddress, setNewaddress] = useState(showNewPhone)
  return (
  <div className="p-6 bg-gray-200 md:w-[850px] h-screen mx-auto">
    <Link to={'/'} ><img className='absolute' src='../../images/Logo.png' /></Link>
    <h1 className="text-4xl font-bold text-center text-indigo-600 mt-2 md:mt-0 mb-10">Contact Info</h1>
    
    {/* address */}
    <div className="flex flex-col items-center mb-10 relative">
      <div className="w-2/3 md:w-1/3 bg-gray-100 group relative border border-indigo-400 rounded py-8 px-10">
        <p className="text-lg font-bold text-indigo-600 mb-5">Address:</p>
        <p className="text-gray-800">{showNewAddress?showNewAddress:"123 Main Street"}</p>
        <AiOutlineEdit  onClick={()=>setAddressUpdate(true)} className='text-indigo-300 text-[21px] absolute bottom-[33px] left-[3px] opacity-0 group-hover:opacity-100 group-hover:cursor-pointer z-[15] shadow-white scale-x-[-1]' title='edit phone number' />
      </div>
      {addressUpdate && (
                <div className='absolute top-[110px] z-30 bg-[#dadada] w-1/3 rounded-md border border-solid border-[#0E6795] p-1'>
                  <textarea type='text' onChange={(e)=>{setNewaddress(e.target.value); setNewAddressErr("")}} className=' w-full text-center border border-solid px-1 pt-1' value={newaddress?newaddress:showNewAddress?` ${showNewAddress}`:" "} />
                  <div className='flex justify-between mt-1'>
                    <button onClick={handleAddressUpdate} className=' bg-[#0E6795] font-bold text-white py-1 px-4 rounded-md'>update adress</button>
                    <button onClick={()=>setAddressUpdate(false)} className=' bg-red-500 font-bold text-white py-1 px-4 rounded-md'>cancel</button>
                  </div>
                  
                  {newAddressErr && 
                    <div className='absolute bottom-[-19px] left-4'>
                        <p className=' text-red-500 text-sm'>{newAddressErr}</p>
                    </div>
                  }
                </div>
      )}
    </div>

    {/* phone */}
    <div className="flex flex-col items-center mb-10 relative">
      <div className="w-2/3 md:w-1/3 bg-gray-100 group relative border border-indigo-400 rounded py-8 px-10">
        <p className="text-lg font-bold text-indigo-600 mb-5">Phone:</p>
        <p className="text-gray-800">{showNewPhone?showNewPhone:"(555) 555-5555"}</p>
        <AiOutlineEdit  onClick={()=>setPhoneUpdate(true)} className='text-indigo-300 text-[21px] absolute bottom-[33px] left-[3px] opacity-0 group-hover:opacity-100 group-hover:cursor-pointer z-[15] shadow-white scale-x-[-1]' title='edit phone number' />
      </div>
      {phoneUpdate && (
                <div className='absolute top-[110px] z-30 bg-[#dadada] w-1/3 rounded-md border border-solid border-[#0E6795] p-1'>
                  <textarea type='text' onChange={(e)=>{setNewPhone(e.target.value); setNewPhoneErr("")}} className=' w-full text-center border border-solid pt-1' value={newPhone?newPhone:showNewPhone?` ${showNewPhone}`:" "} />
                  <div className='flex justify-between mt-1'>
                    <button onClick={handlePhoneUpdate} className=' bg-[#0E6795] font-bold text-white py-1 px-4 rounded-md'>update phone</button>
                    <button onClick={()=>setPhoneUpdate(false)} className=' bg-red-500 font-bold text-white py-1 px-4 rounded-md'>cancel</button>
                  </div>
                  
                  {newPhoneErr && 
                    <div className='absolute bottom-[-19px] left-4'>
                        <p className=' text-red-500 text-sm'>{newPhoneErr}</p>
                    </div>
                  }
                </div>
      )}
    </div>

    <div className="flex flex-col items-center">
      <div className="w-2/3 md:w-1/3 bg-gray-100 border border-indigo-400 rounded py-8 px-10">
        <p className="text-lg font-bold text-indigo-600 mb-2 md:mb-5">Email:</p>
        <p className="text-gray-800">contact@example.com</p>
      </div>
    </div>
  </div>
  );
};

export default ContactInfoPage;
