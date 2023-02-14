import React, { useState, useRef, useEffect, } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {MdCloudUpload, } from 'react-icons/md'
import {AiOutlineEdit, } from 'react-icons/ai'
import { getDatabase, ref as dref, set, push, onValue, update } from "firebase/database";
import { getAuth, signOut, updateProfile } from "firebase/auth";
import { getStorage, ref, uploadString, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { Link, useNavigate } from 'react-router-dom';
import { userLoginInfo } from '../slices/userSlice'
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Watch, } from  'react-loader-spinner'

const Profilebar = () => {
  let data = useSelector((state) => state.userLoginInfo.userInfo)  
  let dispatch = useDispatch()
  let navigate = useNavigate()
  let db = getDatabase()
  let storage = getStorage()
  let auth = getAuth()

  let [imgUploadModal, setImgUploadModal] = useState(false)
  const [image, setImage] = useState();
  const [cropData, setCropData] = useState("#");
  const [cropper, setCropper] = useState();
  const [profilePhotoLoading, setProfilePhotoLoading] = useState(false);

  const [imgToUpload, setImgToUpload] = useState();
  const [readyImgToUploadWindow, setReadyImgToUploadWindow] = useState();
  let [bgImgUploadModal, setBgImgUploadModal] = useState(false)

  let [profileBg, setProfileBg] = useState('../images/Capture1.png')
  let [bgPhotoLoading, setBgPhotoLoading] = useState(false)

  let [userNameUpdate, setUserNameUpdate] = useState(false)
  let [newUsername, setNewUsername] = useState("")
  let [showNewUsername, setShowNewUsername] = useState("")
  let [newUsernameErr, setNewUsernameErr] = useState("")

  let [bioUpdate, setBioUpdate] = useState(false)
  let [showNewBio, setShowNewBio] = useState("")
  let [newBioErr, setNewBioErr] = useState("")  

  let [currentUserPosts, setCurrentUserPosts] = useState([])  

  let handleSignOut = () =>{
    const auth = getAuth();
    signOut(auth).then(() => {
      dispatch(userLoginInfo(null))
      localStorage.removeItem("userInfo")
      navigate('/login')
    }).catch((error) => {
      // An error happened.
    });
  }

      // to select the image and crop it
      const handleProfileUpload = (e) => {
        e.preventDefault();
        let files;
        if (e.dataTransfer) {
          files = e.dataTransfer.files;
        } else if (e.target) {
          files = e.target.files;
        }
        const reader = new FileReader();
        reader.onload = () => {
          setImage(reader.result);
          console.log(files)
        };
        reader.readAsDataURL(files[0]);
      };
  
      // to upload the image to database and use it in the UI
      const getCropData = () => {
        if (typeof cropper !== "undefined") {
        setCropData(cropper.getCroppedCanvas().toDataURL());
        setProfilePhotoLoading(true);
          
        const storageRef = ref(storage, `profilePic/${auth.currentUser.uid}`); // instead of auth.currentUser.uid
        const message4 = cropper.getCroppedCanvas().toDataURL();
        uploadString(storageRef, message4, 'data_url').then((snapshot) => {
        getDownloadURL(storageRef).then((downloadURL) => {
            updateProfile(auth.currentUser, {
            photoURL: downloadURL,
            }).then(()=>{
              update(dref(db, "users/" + data.uid), {
                photoURL: downloadURL, 
                });
              currentUserPosts.map((item)=>{
                  if(item.value.senderid==data.uid){
                    update(dref(db, "posts/" + item.key), {
                    senderphotoURL: downloadURL, }
                  );
                }
              });  
            }).then(()=>{
              setTimeout(()=>{
                setProfilePhotoLoading(false);
                setImgUploadModal(false)
                setImage("")
                setCropData("")
                setCropper("")
              },1000); 
            })
        });
        });
        }
      };
      console.log(data.uid)
      // to cancel uploading of the croped file
      let handleImgUploadModal = () => {
        setImgUploadModal(false)
        setImage("")
        setCropData("")
        setCropper("")
      }    

      let handleBgImageUpload = (e) => {
        setImgToUpload(e.target.files[0])
        if (e.target.files && e.target.files[0]) {
            setReadyImgToUploadWindow(URL.createObjectURL(e.target.files[0]));           
        }     
      }

      let handleBgImageUploadButton = () => {
        setBgPhotoLoading(true)
        const storageRef = ref(storage, `profilebg/${imgToUpload.name}`);        
        const uploadTask = uploadBytesResumable(storageRef, imgToUpload);
          uploadTask.on('state_changed', 
          (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log('Upload is ' + progress + '% done');          
            }, 
          (error) => {
              console.log(error)          
            }, 
          () => {
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                update(dref(db, "users/" + data.uid), {
                  backgroundURL: downloadURL, }
                  ).then(()=>{
                    setTimeout(()=>{
                      setBgPhotoLoading(false);
                      setBgImgUploadModal(false)
                      setImgToUpload("")
                      setReadyImgToUploadWindow("") 
                    },1000); 
                  })         
              });          
            }          
          );      
      }

      useEffect(()=>{
        onValue(dref(db, 'users'), (snapshot) => {
          let arr = [];
          snapshot.forEach((item) => {
              if(item.key == data.uid){
                  arr.push(item.val());
                  setShowNewUsername(item.val().username);
                  setShowNewBio(item.val().bio)
              }
          });
          if(arr[0]){
            setProfileBg(arr[0].backgroundURL)
          }
        });
      }, [])

      useEffect(()=>{
        onValue(dref(db, 'posts'), (snapshot) => {
          let arr = [];
          snapshot.forEach((item) => {
            let datapair = {key: item.key, value: item.val()}  
              if(item.val().senderid == data.uid){
                  arr.push(datapair)
              }
          });
          if(arr.length>0){
            setCurrentUserPosts(arr)
          }
        });
      }, [])

      let handleUserNameUpdate = () => {
        if(!newUsername || newUsername.length<2){
          setNewUsernameErr("* please provide a valid username")
        } else {
          updateProfile(auth.currentUser, {
            displayName: newUsername,
            })
          currentUserPosts.map((item)=>{
            if(item.value.senderid==data.uid){
              update(dref(db, "posts/" + item.key), {
              sendername: newUsername }
            );
            }
          });  
          
          update(dref(db, "users/" + data.uid), {
            username: newUsername }
            ).then(()=>{
            setUserNameUpdate(false)
            setNewUsername("")  
            })  
        }
      }

      let handleBioUpdate = () => {
        if(!newBio ){
          setNewBioErr("* please write something about yourself")
        } else {
          update(dref(db, "users/" + data.uid), {
            bio: newBio }
            ).then(()=>{
            setBioUpdate(false)
            setNewBio("")  
            })  
        }
      }
      let [newBio, setNewBio] = useState(showNewBio)


  return (
    <div className='bg-white md:h-72' >
        <div className='w-full md:h-[120px] relative' >
              <div className='group absolute w-full h-full md:z-10 hidden md:block' >
                <div className=' relative w-full h-full group-hover:bg-[0,0,0,.25]'>
                  <AiOutlineEdit onClick={()=>setBgImgUploadModal(true)} className='text-[#99c2f1] text-2xl absolute top-0 right-0 opacity-0 group-hover:opacity-100 group-hover:cursor-pointer z-[15] shadow-white' title='edit profile background' />
                </div>
                <img className='absolute w-full h-full top-0' src={profileBg?profileBg:'../images/Capture1.png'} />
              </div>
            <div className='absolute'>
                <div className='group relative w-24 h-24 rounded-full mx-auto mt-[72px] border-2 border-solid border-[#F4F4F4] z-20'>
                    <img className='mx-auto w-full h-full rounded-full' src={data.photoURL?data.photoURL:'../images/Logo.png'} />
                    <div onClick={()=>setImgUploadModal(true)} className='w-full h-full rounded-full bg-[rgba(0,0,0,.4)] absolute top-0 left-0 flex justify-center items-center opacity-0 group-hover:opacity-100'>
                    <MdCloudUpload className='text-white text-2xl group-hover:cursor-pointer' title='edit profile picture' />
                    </div>
                </div>
                <h2 className='font-bold text-sm capitalize text-center mt-2 '><span onClick={()=>setUserNameUpdate(true)} className='hover:text-blue-500 hover:underline hover:cursor-pointer' title='edit username' >{showNewUsername? showNewUsername: data.displayName}</span></h2>
                
                <div className='mt-1 px-7 w-[290px]'>
                  <p className='font-regular text-[10px] text-[#181818] text-center relative group'>
                    {showNewBio ? showNewBio.slice(0, 170) + "..." :
                    'please upgrade your bio emidietly.'
                    } 
                  <span className='absolute text-lg top-0 left-[-10px] '><AiOutlineEdit onClick={()=>setBioUpdate(true)} className='text-[#99c2f1] opacity-0 group-hover:opacity-100 cursor-pointer scale-x-[-1]' title='click to update your bio.' /></span></p>
                </div>
                
                <div className='relative bottom-[-75px] flex justify-center'>
                    <button onClick={handleSignOut} className='absolute bg-[#0E6795] font-bold text-white py-2 px-8 rounded-md'>Sign out</button>
                </div> 
            </div>
            <div className='relative bottom-[35px] right-[-60px] flex justify-center'>
                    <Link to='/profile'><button className='absolute bg-[#0E6795] font-bold text-white py-[5px] px-3 rounded-md'>profile</button></Link>
            </div>
              {userNameUpdate && (
                <div className='absolute  top-[200px] z-30 bg-[#dadada] w-full rounded-md border border-solid border-[#0E6795] p-1'>
                  <input onChange={(e)=>{setNewUsername(e.target.value); setNewUsernameErr("")}} className=' w-full p-2 text-center border border-solid' placeholder='new username' value={newUsername} />
                  <div className='flex justify-between mt-1'>
                    <button onClick={handleUserNameUpdate} className=' bg-[#0E6795] font-bold text-white py-1 px-4 rounded-md'>update username</button>
                    <button onClick={()=>setUserNameUpdate(false)} className=' bg-red-500 font-bold text-white py-1 px-4 rounded-md'>cancel</button>
                  </div>
                  
                  {newUsernameErr && 
                    <div className='absolute bottom-[-19px] left-4'>
                        <p className=' text-red-500 text-sm'>{newUsernameErr}</p>
                    </div>
                  }
                </div>
              )}

              {bioUpdate && (
                <div className='absolute  top-[200px] z-30 bg-[#dadada] w-full rounded-md border border-solid border-[#0E6795] p-1'>
                  <textarea type='text' onChange={(e)=>{setNewBio(e.target.value); setNewBioErr("")}} className=' w-full p-2 text-center border border-solid' value={newBio?newBio:showNewBio?` ${showNewBio}`:" "} />
                  <div className='flex justify-between mt-1'>
                    <button onClick={handleBioUpdate} className=' bg-[#0E6795] font-bold text-white py-1 px-4 rounded-md'>update bio</button>
                    <button onClick={()=>setBioUpdate(false)} className=' bg-red-500 font-bold text-white py-1 px-4 rounded-md'>cancel</button>
                  </div>
                  
                  {newBioErr && 
                    <div className='absolute bottom-[-19px] left-4'>
                        <p className=' text-red-500 text-sm'>{newBioErr}</p>
                    </div>
                  }
                </div>
              )}
        </div> 

        {imgUploadModal && (
        <div className='w-full z-50 h-screen bg-black fixed top-0 left-0 flex justify-center items-center'>
          <div className='w-2/4 bg-white rounded-lg p-5'>
            <h2 className='font-nunito font-bold text-4xl text-heading'>Upload Your Profile</h2>
        
            {image
            ? 
            <div className='group relative w-28 h-28 overflow-hidden mx-auto rounded-full'>
              <div className="img-preview w-full h-full rounded-full" />
            </div>
            :
            <div className='group relative w-28 h-28 overflow-hidden mx-auto rounded-full'>
              <img className='mx-auto w-full h-full rounded-full' src={data.photoURL} /> 
            </div> //'../images/demoimg.png'
             }

            <input type="file" onChange={handleProfileUpload} className='mt-2' />
            <br />

            {image && 
              <Cropper
                style={{ height: 400, width: "100%" }}
                zoomTo={0.5}
                initialAspectRatio={1}
                preview=".img-preview"
                src={image}
                viewMode={1}
                minCropBoxHeight={10}
                minCropBoxWidth={10}
                background={false}
                responsive={true}
                autoCropArea={1}
                checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
                onInitialized={(instance) => {
                  setCropper(instance);
                }}
                guides={true}
              />
            }

            {profilePhotoLoading?
            <div className='relative w-full h-[68px] mt-4'>
              <div className='absolute top-[0px] left-[280px]'>
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
            :
            <><button onClick={getCropData} className='bg-black rounded font-nunito font-semibold text-xl text-white px-8 py-5 mt-3'>Upload</button>
            <button onClick={handleImgUploadModal} className='bg-red-500 rounded font-nunito font-semibold text-xl text-white px-8 py-5 ml-4'>Cancel</button></>}

          </div>
        </div>
        )}

        {bgImgUploadModal && (
           <div className='fixed top-0 left-0 w-full h-screen bg-primary z-50 flex justify-center items-center bg-black '>
            <div className='bg-white p-5 rounded w-100 text-center '>
              <h3 className='font-nunito font-bold text-4xl text-heading'>
              Select image to send
              </h3>
              {readyImgToUploadWindow ? 
                  <div>
                      <img className='w-[600px] h-[400px]' src={readyImgToUploadWindow} />
                  </div>
                  :
                  <div>
                      <img className='w-[600px] h-[400px]' src={profileBg} />
                  </div>
              }
              <div className='flex justify-center'>
                  <input onChange={handleBgImageUpload} type='file' className='w-[150px] font-nunito font-semibold text-xl text-white p-5' />
              </div>
              <div className='relative mt-3'>
                {!bgPhotoLoading?
                  <><button onClick={handleBgImageUploadButton} className='bg-green-500 rounded font-nunito font-semibold text-xl text-white p-5'>set image as background</button>
                  <button onClick={()=>{setBgImgUploadModal(false); setImgToUpload(""); setReadyImgToUploadWindow("")}} className='bg-red-500 rounded font-nunito font-semibold text-xl text-white p-5 ml-5'>cancel</button></>
                :
                <div className='relative w-full h-[68px] mt-46'>
                  <div className='absolute top-[0px] left-[280px]'>
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
                </div>}
              </div>
            </div>
          </div>                     
        )}

    </div>
  )
}

export default Profilebar