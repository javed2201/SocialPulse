import React, { useState, useRef, useEffect, } from 'react'
import {MdAddToDrive, MdOutlineDeleteOutline} from "react-icons/md"
import { useDispatch, useSelector } from 'react-redux'
import { getDatabase, ref, set, push, onValue, update, remove } from "firebase/database";
import { getAuth, signOut, updateProfile } from "firebase/auth";
import { getStorage, ref as sref, uploadString, getDownloadURL, uploadBytesResumable } from "firebase/storage";

const Projects = () => {

    let data = useSelector((state) => state.userLoginInfo.userInfo)  
    let db = getDatabase()
    let storage = getStorage()
    let auth = getAuth()    
    
    const [projecToUpload, setProjecToUpload] = useState();
    const [readyProjectToUploadWindow, setReadyProjectToUploadWindow] = useState();
    let [projectUploadModal, setProjectUploadModal] = useState(false)
    let [projectInfo, setProjectInfo] = useState([])
    let [projectAllInfo, setProjectAllInfo] = useState([])
    let [projectImg, setProjectImg] = useState("../images/Capture1.png")
    let [showAllPosts, setShowAllPosts] = useState(false)

    useEffect(()=>{
        onValue(ref(db, 'projects'), (snapshot) => {
          let arr = [];
          let arr2 = []
          snapshot.forEach((item) => {
              if(item.val().projectWonerid == data.uid){
                  arr.push(item.val());
                  let datapair = {key: item.key, value: item.val()}
                  arr2.push(datapair)
              }
          });
          setProjectImg(arr[0].projectimg)
          setProjectInfo(arr.reverse())
          setProjectAllInfo(arr2)
        });
      }, [])  
    
      let handleProjectUpload = (e) => {
          setProjecToUpload(e.target.files[0])
        if (e.target.files && e.target.files[0]) {
            setReadyProjectToUploadWindow(URL.createObjectURL(e.target.files[0]));           
        }     
      }

      let handleProjectUploadButton = () => {
        const storageRef = sref(storage, `projectsimg/`+projecToUpload.name);        //projectsimg/${projecToUpload.name}
        const uploadTask = uploadBytesResumable(storageRef, projecToUpload);
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
                console.log(downloadURL, data.uid);
                set(push(ref(db, 'projects')), {
                    projectimg: downloadURL,
                    projectWonerid: data.uid, 
                  }
                  ).then(()=>{
                  setProjectUploadModal(false)
                  setProjecToUpload("")
                  setReadyProjectToUploadWindow("")  
                  })          
              });
                        
            }          
          );      
      }
      
    let handleProjectDelete = (sitem, sindex) => {
      projectAllInfo.map((item)=>{
        if(item.value.projectWonerid==sitem.projectWonerid&&item.value.projectimg==sitem.projectimg){
          remove(ref(db, "projects/" + item.key))
        }
      })
    }
  
    return (
    <>    
    {projectUploadModal ? (
        <div className='fixed top-0 left-0 w-full h-screen bg-primary z-50 flex justify-center items-center bg-black '>
            <div className='bg-white p-5 rounded w-100 text-center '>
               <h3 className='font-nunito font-bold text-4xl text-heading'>
               Select image to send
               </h3>
               {readyProjectToUploadWindow ? 
                   <div>
                       <img className='w-[600px] h-[400px]' src={readyProjectToUploadWindow} />
                   </div>
                   :
                   <div>
                       <img className='w-[600px] h-[400px]' src={projectImg} />
                   </div>
               }
               <div className='flex justify-center'>
                   <input onChange={handleProjectUpload} type='file' className='w-[150px] font-nunito font-semibold text-xl text-white p-5' />
               </div>
               <div className='relative mt-3'>
                   {projecToUpload&&<button onClick={handleProjectUploadButton} className='bg-green-500 rounded font-nunito font-semibold text-xl text-white p-5'>select image as your project</button>}
                   <button onClick={()=>{setProjectUploadModal(false); setProjecToUpload(""); setReadyProjectToUploadWindow("")}} className='bg-red-500 rounded font-nunito font-semibold text-xl text-white p-5 ml-5'>cancel</button>
               </div>
            </div>
        </div>                     
    ):
        
    <div className='w-full bg-white p-8 mt-5 rounded'>
        <div className='flex justify-between items-center'>
            <div className='flex gap-6'>
                <h3 className='font-bold text-lg text-[#181818]'>Projects</h3>
                {projectInfo&&projectInfo.length>0?
                <p className='text-lg text-[#747474]'>{showAllPosts?projectInfo.length:projectInfo.length>2?"3":projectInfo.length} of {projectInfo.length}</p>
                :
                <p className='text-lg text-[#747474]'>upload here your posts</p>
                }
            </div>
            <div className='py-1'>
                <MdAddToDrive onClick={()=>setProjectUploadModal(true)} className='text-xl font-bold text-[#747474] cursor-pointer' />
            </div>
        </div>
        
        <div className='mt-5 flex flex-wrap gap-[10px] md:gap-[27px]'>
            {projectInfo.map((item, index) => (
                <>
                {(index<3&&!showAllPosts)&&
                <div className='w-[31%] group relative'>
                  <img src={item.projectimg} className='h-24 md:h-40 w-full' />
                  <MdOutlineDeleteOutline onClick={()=>handleProjectDelete(item, index)} className='text-2xl text-[#747474] absolute top-0 left-0 opacity-0 group-hover:opacity-100 group-hover:cursor-pointer z-[15] shadow-white' title='delete your project' />
                </div>                
                }
                {showAllPosts&&<img src={item.projectimg} className='h-28 md:h-40 w-[31%]' />}
                </>
            ))}
        </div>
        {(projectInfo&&projectInfo.length>3)&&<p onClick={()=>setShowAllPosts(!showAllPosts)} className='font-medium text-sm text-[#0275B1] mt-5'>{showAllPosts?"Show less":"Show all"} ({showAllPosts?"3":projectInfo.length})</p>}
    </div>
    }
    </>
  )
}

export default Projects