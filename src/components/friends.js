import React, { useState, useEffect } from 'react'
import { onValue, getDatabase, ref, set, push, update, remove  } from 'firebase/database'
import { useSelector } from 'react-redux'
import { userLoginInfo } from '../slices/userSlice'


const Friends = () => {
    let db = getDatabase()
    let data = useSelector((state) => state.userLoginInfo.userInfo)
    
    let [userList, setUserList] = useState([])
    let [friendRequestList, setFriendRequestList] = useState([])
    let [friendRequestKey, setFriendRequestKey] = useState([])
    
    useEffect(()=>{
        const usersref = ref(db, 'users')
        onValue(usersref, (snapshot) => {
          let arr = [];
          snapshot.forEach((item) => {
            let datapair = {key: item.key, value:item.val()}
            arr.push(datapair);
          });
          setUserList(arr)  
        });        
      }, [])

      
      useEffect(()=>{
        const friendrequestsref = ref(db, 'friendrequests')
        onValue(friendrequestsref, (snapshot) => {
            let arr = [];
            let arr2 = [];
            snapshot.forEach((item) => {
              let datapair = {key: item.key, value:item.val()}
              arr2.push(datapair);
              arr.push(item.val().senderid+item.val().receiverid);
            });
                setFriendRequestList(arr)
                setFriendRequestKey(arr2)
                // console.log(arr2.value)
          });        
      }, [])

    let handleFriendRequest = (item) => {
        set(push(ref(db, 'friendrequests')), {
            senderid: data.uid,
            sendername: data.displayName,
            receiverid: item.key,
            receivername: item.value.username,
          })
        console.log(data.uid+item.key)  
        console.log(item.key+data.uid)  
    }

    let handleUndoFriendRequest = (item) => {
        friendRequestKey.map((sitem)=>{
            if(item.includes(sitem.value.senderid)){
            const cancelFriendRequestref = ref(db, "friendrequests/" + sitem.key);
            remove(cancelFriendRequestref)}
        })
    }

    let handleCancelFriendRequest = (item) => {
        friendRequestKey.map((sitem)=>{
            if(item.includes(sitem.value.receiverid)){
            const cancelFriendRequestref = ref(db, "friendrequests/" + sitem.key);
            remove(cancelFriendRequestref)}
        })
    }        

  return (
    <>
    <div className='w-full bg-[#0077B5] p-3 mt-5 text-center '>
        <h3 className='font-bold text-[20px] text-white py-2 '>All Users</h3>
    </div>
    {userList.map((item, index) => (
    <> {item.key != data.uid &&   
      <div className='w-full rounded'>
        <div className='bg-white flex justify-between items-center p-8 mt-10 rounded'>
            <div className='bg-white flex gap-4 py-6 rounded-b-[4px]'>
                <div>
                    <div className='w-14 h-14 rounded-full'>
                        <img className=' w-full h-full rounded-full' src={item.value.photoURL?item.value.photoURL:'../images/exp2.png'} />
                    </div>
                </div>
                <div className=''>
                    <div>
                        <div>
                            <h3 className='font-medium text-sm capitalize text-[#181818]'>{item.value.username}</h3>
                            <div className='mt-2'>
                                <p className='text-xs capitalize text-[#181818] '>{item.value.email}</p>
                            </div>
                        </div>
                        <div className='mt-3 text-left '>
                            <p className='max-w-[475px] font-regular text-xs text-ellipsis text-[#181818] relative group'>
                                {item.value.bio}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className=''>
                {friendRequestList.length<1 ?
                    <button onClick={()=>handleFriendRequest(item)} className='bg-[#0077B5] font-bold uppercase text-white py-2 px-6 rounded-md'><span className='hidden md:block'>send friend request</span><span className='block md:hidden'>+</span></button>
                :
                    friendRequestList.includes(item.key+data.uid)?
                    <div className=''> 
                        <div className='text-center mb-2'>
                            <button onClick={()=>handleCancelFriendRequest()} className='bg-[#0077B5] text-sm md:text-[16px] font-bold uppercase text-white py-2 px-2 md:px-4 rounded-md md:flex md:gap-1'>accept <span className='hidden md:block'>friend request</span></button>
                        </div>
                        <div className='text-center'>
                            <button onClick={()=>handleCancelFriendRequest(item.key+data.uid)} className='bg-[#e93119] text-sm md:text-[16px] font-bold uppercase text-white py-2 px-2 md:px-[15px] rounded-md md:flex md:gap-1'>cancel <span className='hidden md:block'>request</span></button>
                        </div>
                    </div>
                    : friendRequestList.includes(data.uid+item.key)?
                    <button onClick={()=>{handleUndoFriendRequest(data.uid+item.key);}} className='bg-[#e93119] font-bold uppercase text-white py-2 px-3 md:px-6 rounded-md md:flex md:gap-1'>cancel <span className='hidden md:block'>sent request</span></button>
                    :
                    <button onClick={()=>handleFriendRequest(item)} className='bg-[#0077B5] font-bold uppercase text-white py-2 px-3 md:px-6 rounded-md'><span className='hidden md:block'>send friend request</span><span className='block md:hidden'>+</span></button> 
                }       
            </div>
        </div>
      </div>
    } </>  
    )
    )}
    </>
  )
}

export default Friends