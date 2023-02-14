import React, { useState, useRef, useEffect, } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {AiOutlineEdit, } from 'react-icons/ai'
import {BiDotsHorizontalRounded, BiEdit } from 'react-icons/bi'
import {FaLinkedin, } from 'react-icons/fa'
import {GrFormAdd, GrClose } from 'react-icons/gr'
import {MdCloudUpload, MdOutlineDeleteOutline, } from 'react-icons/md'
import {TiLocationArrow, } from 'react-icons/ti'
import { getDatabase, ref, set, push, onValue, update, remove } from "firebase/database";
import { getAuth, signOut, updateProfile } from "firebase/auth";
import { getStorage, ref as sref, uploadString, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { Link, useNavigate } from 'react-router-dom';
import { userLoginInfo } from '../../slices/userSlice'
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import Friends from '../../components/friends'
import Projects from '../../components/projects'


function ProfilePage() {

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
  
    const [imgToUpload, setImgToUpload] = useState();
    const [readyImgToUploadWindow, setReadyImgToUploadWindow] = useState();
    let [bgImgUploadModal, setBgImgUploadModal] = useState(false)
  
    let [profileBg, setProfileBg] = useState("../images/Capture1.png")
  
    let [userNameUpdate, setUserNameUpdate] = useState(false)
    let [newUsername, setNewUsername] = useState("")
    let [showNewUsername, setShowNewUsername] = useState("")
    let [newUsernameErr, setNewUsernameErr] = useState("")

    let [showNewProfilePhoto, setShowNewProfilePhoto] = ("")
  
    let [bioUpdate, setBioUpdate] = useState(false)
    let [showNewBio, setShowNewBio] = useState("")
    let [newBioErr, setNewBioErr] = useState("")  

    let [showProfilePage, setShowProfilePage] = useState(true)
    let [showFriendsPage, setShowFriendsPage] = useState(false)
    let [showPostsPage, setShowPostsPage] = useState(false)

    let [postList, setPostList] = useState([])
    let [showPostEditbox, setShowPostEditbox] = useState(false)


    let [postKeys, setPostKeys] = useState([])
    
    let [editPostModal, setEditPostModal] = useState(false)
    let [clickedPost, setClickedPost] = useState()
    let [clickPostKey, setClickPostKey] = useState()
    const [editPostImg, setEditPostImg] = useState();
    const [editPostImgPreview, setEditPostImgPreview] = useState();
    const [showEditPostText, setShowEditPostText] = useState();

    const [currentUserPosts, setCurrentUserPosts] = useState([]);

    const [showAddress, setShowAddress] = useState("");

    const [addExpModal, setAddExpModal] = useState(false);
    let [expCompanyLogo, setExpCompanyLogo] = useState("")
    let [Jobtitle, setJobtitle] = useState("")
    let [companyName, setCompanyName] = useState("")
    let [workLocation, setWorkLocation] = useState("")
    let [period, setPeriod] = useState("")
    let [description, setDescription] = useState("")
    let [addExpErr, setAddExpErr] = useState("")
    let [expDetails, setExpDetails] = useState([])

    const [addEduModal, setAddEduModal] = useState(false);
    let [instLogo, setInstLogo] = useState("")
    let [instName, setInstName] = useState("")
    let [degreeName, setDegreeName] = useState("")
    let [subjectName, setSubjectName] = useState("")
    let [grade, setGrade] = useState("")
    let [gradYear, setGradYear] = useState("")
    let [courses, setCourses] = useState("")
    let [addEduErr, setAddEduErr] = useState("")
    let [eduDetails, setEduDetails] = useState([])

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
          };
          reader.readAsDataURL(files[0]);
        };

        // to upload the image to database and use it in the UI
        const getCropData = () => {
          if (typeof cropper !== "undefined") {
            setCropData(cropper.getCroppedCanvas().toDataURL());
            
          const storageRef = sref(storage, `profilePic/${auth.currentUser.uid}`); // instead of auth.currentUser.uid
          const message4 = cropper.getCroppedCanvas().toDataURL();
          uploadString(storageRef, message4, 'data_url').then((snapshot) => {
          getDownloadURL(storageRef).then((downloadURL) => {
              updateProfile(auth.currentUser, {
              photoURL: downloadURL,
              }).then(()=>{
                update(ref(db, "users/" + data.uid), {
                  photoURL: downloadURL, 
                });
                currentUserPosts.map((item)=>{
                  if(item.value.senderid==data.uid){
                    update(ref(db, "posts/" + item.key), {
                    senderphotoURL: downloadURL, }
                  );
                }
              });   
                setImgUploadModal(false)
                setImage("")
                setCropData("")
                setCropper("")
              })
          });
          });
          }
        };
    
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
          const storageRef = sref(storage, `profilebg/${imgToUpload.name}`);        
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
                  update(ref(db, "users/" + data.uid), {
                    backgroundURL: downloadURL, }
                    ).then(()=>{
                    setBgImgUploadModal(false)
                    setImgToUpload("")
                    setReadyImgToUploadWindow("")  
                    })          
                });          
              }          
            );      
        }
  
        useEffect(()=>{
          onValue(ref(db, 'users'), (snapshot) => {
            let arr = [];
            snapshot.forEach((item) => {
                if(item.key == data.uid){
                    arr.push(item.val());
                    setShowNewUsername(item.val().username);
                    setShowNewBio(item.val().bio)
                    setShowNewProfilePhoto(item.val().photoURL)
                    setShowAddress(item.val().address)
                }
            });
            setProfileBg(arr[0].backgroundURL)
          });
        }, [])
        console.log(showAddress)

        useEffect(()=>{
            onValue(ref(db, 'posts'), (snapshot) => {
              let arr = [];
              let arr2 = [];
              snapshot.forEach((item) => {
                arr.push(item.val());
                arr2.push(item.key);
              });
              arr.map((item2, index)=>{
                if((item2.senderid==data.uid)&&(item2.senderphotoURL!=data.photoURL)){
                    update(ref(db, "posts/" + arr2[index]), {
                      senderphotoURL: data.photoURL }
                    );
                } 
              });
              setPostList(arr)
              setPostKeys(arr2)
          })
        }, [])

        useEffect(()=>{
          onValue(ref(db, 'posts'), (snapshot) => {
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

        useEffect(()=>{
          onValue(ref(db, 'experience'), (snapshot) => {
            let arr = [];
            snapshot.forEach((item) => {
              let datapair = {key: item.key, value: item.val()}  
                if(item.val().wonerid == data.uid){
                    arr.push(datapair)
                }
            });
            if(arr.length>0){
              setExpDetails(arr)
            }
          });
        }, [])

        useEffect(()=>{
          onValue(ref(db, 'education'), (snapshot) => {
            let arr = [];
            snapshot.forEach((item) => {
              let datapair = {key: item.key, value: item.val()}  
                if(item.key == data.uid){
                    arr.push(datapair)
                }
            });
            if(arr.length>0){
              setEduDetails(arr)
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
            update(ref(db, "posts/" + data.uid), {
              sendername: newUsername }
              );
            update(ref(db, "users/" + data.uid), {
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
            update(ref(db, "users/" + data.uid), {
              bio: newBio }
              ).then(()=>{
              setBioUpdate(false)
              setNewBio("")  
              })  
          }
        }
        let [newBio, setNewBio] = useState(showNewBio)

        let handleShowProfilePage = () => {
            setShowProfilePage(true)
            setShowFriendsPage(false)
            setShowPostsPage(false)
        }
        let handleShowFriendsPage = () => {
            setShowFriendsPage(true)
            setShowProfilePage(false)
            setShowPostsPage(false)
        }
        let handleShowPostPage = () => {
            setShowPostsPage(true)
            setShowFriendsPage(false)
            setShowProfilePage(false)
        }
      
          let handleClick = (e, data, index, item) => {
            setClickedPost(postList[index]);
            setClickPostKey(postKeys[index]);
            setShowEditPostText(postList[index].posttext)
          }
      
          let handlePostEdit = (e) => {
          setShowPostEditbox(false);
          setEditPostModal(true)
          console.log(e.target)
          }
      
        let handleEditPostImage = (e) => {
          setEditPostImg(e.target.files[0])
          if (e.target.files && e.target.files[0]) {
              setEditPostImgPreview(URL.createObjectURL(e.target.files[0]));           
          }     
        }
      
        let handleEditPostImageButton = () => {
          if(editPostImg && editPostText){
            const storageRef = sref(storage, `Imgmsg/${editPostImg.name}`);        
            const uploadTask = uploadBytesResumable(storageRef, editPostImg);
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
                    
                    update(ref(db, "posts/" + clickPostKey), {
                      postimg: downloadURL,
                      posttext: editPostText,
                      }
                      ).then(()=>{
                      setEditPostModal(false)
                      setEditPostImg("")
                      setEditPostImgPreview("")
                      setEditPostText("")  
                      setClickedPost("")
                      setClickPostKey("")
                      })          
                  });          
                }          
              );   
          } else if(editPostImg){
            const storageRef = sref(storage, `Imgmsg/${editPostImg.name}`);        
            const uploadTask = uploadBytesResumable(storageRef, editPostImg);
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
                    
                    update(ref(db, "posts/" + clickPostKey), {
                      postimg: downloadURL,
                      }
                      ).then(()=>{
                      setEditPostModal(false)
                      setEditPostImg("")
                      setEditPostImgPreview("")
                      setEditPostText("")  
                      setClickedPost("")
                      setClickPostKey("")
                      })          
                  });          
                }          
              );   
            } else if(editPostText){
              update(ref(db, "posts/" + clickPostKey), {
                posttext: editPostText,
                }
                ).then(()=>{
                setEditPostModal(false)
                setEditPostImg("")
                setEditPostImgPreview("")
                setEditPostText("")  
                setClickedPost("")
                setClickPostKey("")
                })   
              } else{
                  setEditPostModal(false)
                  setEditPostImg("")
                  setEditPostImgPreview("")
                  setEditPostText("") 
                  setClickedPost("")
                  setClickPostKey("")
                }   
        }
      
        let handleDeletePost = () => {
          remove(ref(db, "posts/" + clickPostKey)).then(()=>{
            setClickPostKey("");
            setEditPostModal(false); 
            setEditPostImg(""); 
            setEditPostImgPreview(""); 
          })
        }
        
        const [editPostText, setEditPostText] = useState(showEditPostText);

        let handleAddExp = () => {
          if(!Jobtitle||!companyName||!workLocation||!period||!description){
              setAddExpErr('* please fill all the text field')
          } else {
              setAddExpErr('')

              const storageRef = sref(storage, `expimg/`+expCompanyLogo.name);        
              const uploadTask = uploadBytesResumable(storageRef, expCompanyLogo);
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
                      set(push(ref(db, 'experience/')), {
                        wonerid: data.uid,
                        Jobtitle: Jobtitle,
                        companyName: companyName,
                        companyLogo: downloadURL,
                        workLocation: workLocation,
                        period: period,
                        description: description, 
                        }
                        ).then(()=>{
                        setAddExpModal(false) 
                        })          
                    });
                              
                  }          
                );   
          }
      }

      let handleExpDelete = (item) => {
        remove(ref(db, "experience/" + item))
      }

      let handleAddEdu = () => {
        if(!instName||!degreeName||!subjectName||!grade||!gradYear||!courses){
            setAddEduErr('* please fill all the text field')
        } else {
            setAddEduErr('')

            const storageRef = sref(storage, `eduinstimg/`+instLogo.name);        
            const uploadTask = uploadBytesResumable(storageRef, instLogo);
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
                    update(ref(db, 'education/'+ data.uid), {
                      instLogo: downloadURL,
                      instName: instName,
                      degreeName: degreeName,
                      subjectName: subjectName,
                      grade: grade,
                      gradYear: gradYear,
                      courses: courses, 
                      }
                      ).then(()=>{
                      setAddEduModal(false) 
                      })          
                  });
                            
                }          
              );   
        }
    }

  return (
   <div className='bg-[#F7F9FB] '>

    <div className='w-full md:w-[850px] mx-auto' >
        <div className='w-full' >
            <Link to={'/'} ><img className='p-1 z-50' src='../../images/Logo.png' /></Link>
            <div className='group w-full h-[180px] relative rounded-t-[4px]' >
                <div className=' relative w-full h-full group-hover:bg-[0,0,0,.25]'>
                  <AiOutlineEdit onClick={()=>setBgImgUploadModal(true)} className='text-[#99c2f1] text-2xl absolute top-0 right-0 opacity-0 group-hover:opacity-100 group-hover:cursor-pointer z-[15] shadow-white' title='edit profile background' />
                </div>
                <img className='absolute w-full h-full top-0' src={profileBg?profileBg:'../images/Capture1.png'} />
            </div>
            
            <div className='md:h-[180px] bg-white flex justify-between gap-6 p-3 md:p-6 rounded-b-[4px]'>
                <div className='w-1/5'>
                    <div className='group mt-[-38px] md:mt-[-48px] relative w-[90px] md:w-[170px] h-[90px] md:h-[170px] rounded-full mx-auto border-4 md:border-8 border-solid border-[#FFF]'>
                        <img className='mx-auto w-full h-full rounded-full' src={data.photoURL?data.photoURL:'../images/Logo.png'} />
                        <div onClick={()=>setImgUploadModal(true)} className='w-full h-full rounded-full bg-[rgba(0,0,0,.4)] absolute top-0 left-0 flex justify-center items-center opacity-0 group-hover:opacity-100'>
                        <MdCloudUpload className='text-white text-2xl group-hover:cursor-pointer' title='edit profile picture' />
                        </div>
                    </div>
                </div>
                <div className='w-4/5 relative ml-2 md:ml-0'>
                    <div className='flex justify-between w-full'>
                        <div className='flex justify-between gap-4 md:gap-7'> 
                            <h2 className='font-bold text-[18px] text-[#181818] capitalize '><span onClick={()=>setUserNameUpdate(!userNameUpdate)} className='hover:text-blue-500 hover:underline hover:cursor-pointer' title='edit username' >{showNewUsername? showNewUsername: data.displayName}</span></h2>
                            <FaLinkedin className='text-[#CDB87B] rounded-md' />
                        </div>
                        <div className='flex justify-between gap-2 items-center hidden md:block'>
                            <TiLocationArrow className='text-[#0275B1]' />
                            <p className='text-xs tex-[#181818]' title='to edit address go to contact page' >{showAddress?showAddress:"Saint Petersburg, Russian Federation"}</p>
                        </div>
                    </div>
                    <div>
                        <div className='md:mt-3 text-left '>
                            <p className='font-regular text-sm text-ellipsis text-[#181818] relative group'>
                                {showNewBio ? showNewBio.slice(0, 170) + "..." :
                                'please upgrade your bio emidietly.'
                                } 
                            <span className='absolute text-lg top-0 left-[-16px] '><AiOutlineEdit onClick={()=>setBioUpdate(!bioUpdate)} className='text-[#99c2f1] opacity-0 group-hover:opacity-100 cursor-pointer scale-x-[-1]' title='click to update your bio.' /></span></p>
                        </div>
                    </div>
                    <div className='absolute bottom-[265px] md:bottom-0 left-[32px] md:left-0'>
                        <Link to='/contact'><button className='bg-[#0077B5] font-bold uppercase text-white py-2 px-8 rounded-md'>Contact Info</button></Link>
                    </div>
                </div>
            </div>
            
            <div className='w-full mt-5 flex justify-between rounded'>
                {showProfilePage ?(
                   <div className='w-1/3'>
                    <button className='w-full bg-[#0077B5] font-bold uppercase text-white py-2 px-8 rounded-xs'>Profile</button>
                   </div>
                ):(
                   <div className='w-1/3'>
                    <button onClick={handleShowProfilePage} className='w-full bg-white hover:bg-[#0077B5] font-bold uppercase hover:text-white py-2 px-8 rounded-xs'>Profile</button>
                   </div>
                )}
                {showFriendsPage ?(
                  <div className='w-1/3 border-x-2 border-solid border-[#F7F9FB]'>
                    <button className='w-full bg-[#0077B5] font-bold uppercase text-white py-2 px-8 rounded-xs'>Friends</button>
                  </div>
                ):(
                  <div className='w-1/3 border-x-2 border-solid border-[#F7F9FB]'>
                   <button onClick={handleShowFriendsPage} className='w-full bg-white hover:bg-[#0077B5] font-bold uppercase hover:text-white py-2 px-8 rounded-xs'>Friends</button>
                  </div>
                )}
                {showPostsPage ?(
                  <div className='w-1/3'>
                    <button className='w-full bg-[#0077B5] font-bold uppercase text-white py-2 px-8 rounded-xs'>Post</button>
                  </div>
                ):(
                  <div className='w-1/3'>
                   <button onClick={handleShowPostPage} className='w-full bg-white hover:bg-[#0077B5] font-bold uppercase hover:text-white py-2 px-8 rounded-xs'>Post</button>
                  </div>
                )}
            </div>

            {showPostsPage ?(
             <>
             {!editPostModal ? (
              <div className='py-6 '>
                 {postList.map((item, index)=>(
                     <>{item.senderid==data.uid &&
                     <div className='w-full min-h-[233px] bg-white inline-block py-3 relative mb-8'>
                     <div className='relative'>
                       <div className='pb-3 box-content border-b border-solid border-[#F4F4F4] flex justify-end'>
                           <BiDotsHorizontalRounded value={data.id} onClick={((e) => {handleClick(e, data, index, item); setShowPostEditbox(!showPostEditbox)})} className='mr-4 ' />
                           {(showPostEditbox&&item==clickedPost) && <button onClick={()=>{clickedPost.senderid==data.uid?handlePostEdit():setShowPostEditbox(false)}} className='absolute top-[12px] right-[15px] bg-[#e5e7eb] text-[#5a5a5a] py-[1px] px-[9px] font-semibold border border-solid border-[#5a5a5a] rounded-[6px] ' >{clickedPost.senderid==data.uid?"edit":"edit allowed for owner only!"}</button>} 
                           {/*  */}
                       </div>
                     </div>
                     
                     <div className='py-4 px-8'>
                         <div className='flex justify-start gap-4 items-center'>
                         <div>
                           <img src={item.senderphotoURL? item.senderphotoURL: '../images/developer.png'} className='w-12 h-12 rounded-full ' />
                         </div>
                         <div>
                             <h3 className='font-bold text-sm'>{item.sendername}</h3>
                             <p className='font-regular text-xs'>iOS developer</p>
                         </div>
                         </div>
                         <p className='mt-4 font-regular text-sm text-justify '>{item.posttext}</p>
                         <img src={item.postimg} className='w-full mt-4' />
                     </div>
                     </div>
                    }</>           
                 ))}
              </div> 
             ):(
                <div className='absolute top-0 left-0 w-full h-screen bg-primary z-50 flex justify-center items-center bg-black '>
                    <div className='bg-white p-5 pb-0 h-full rounded text-center flex justify-center items-center'>
                        <h3 className='absolute top-2 font-nunito font-bold text-4xl text-heading mb-2'>
                            add or edit "Image or Text" of the post
                        </h3>
                        <div className='bg-[#dadada] w-2/5 h-[513px] rounded-md border border-solid border-[#0E6795] p-1 '>
                            <textarea type='text' onChange={(e)=>setEditPostText(e.target.value)} className='h-full w-full p-2 text-center border border-solid ' value={editPostText?editPostText:` ${showEditPostText}`} />
                            <div className='flex justify-between mt-1'>
                            </div>
                        </div>
                        <div className='bg-white p-5 rounded text-center '>
                        {/* <h3 className='font-nunito font-bold text-4xl text-heading mb-2'>
                        add or edit image of text of the post
                        </h3> */}
                        {editPostImgPreview ? 
                            <div>
                                <img className='w-[600px] h-[400px]' src={editPostImgPreview} />
                            </div>
                            :
                            <div>
                                <img className='w-[600px] h-[400px]' src={clickedPost.postimg} />
                            </div>
                        }
                        <div className='flex justify-center'>
                            <input onChange={handleEditPostImage} type='file' className='w-[150px] font-nunito font-semibold text-xl text-white p-5' />
                        </div>
                        <div className='relative mt-3'>
                            <button onClick={handleEditPostImageButton} className='bg-[#0E6795] rounded-lg font-nunito font-semibold text-xl text-white py-3 px-5'>post this update</button>
                            <button onClick={()=>{setEditPostModal(false); setEditPostImg(""); setEditPostImgPreview(""); setClickedPost(""); setClickPostKey("")}} className='bg-[#e70101] rounded-lg font-nunito font-semibold text-xl text-white py-3 px-5 ml-5'>cancel</button>
                            <button onClick={()=>{setClickedPost(""); handleDeletePost()}} className='bg-[#e70101] rounded-lg font-nunito font-semibold text-xl text-white py-3 px-5 ml-5'>delete</button>
                        </div>
                        </div>
                    </div>
                </div>
             )}
             </>
            ): showFriendsPage ? (
                <Friends />
            ):(
            <div className='w-full rounded'>
                <div className='w-full bg-white p-8 mt-5'>
                    <h3 className='font-bold text-lg text-[#181818] py-2 '>About</h3>
                    <p className='text-sm text-[#181818] leading-normal py-1'>I'm more experienced in eCommerce web projects and mobile banking apps, but also like to work with creative projects, such as landing pages or unusual corporate websites.</p>
                    <p className='text-sm text-[#0275B1] pt-5'>See more</p>
                </div>

                <Projects />

                <div className='w-full bg-white p-8 mt-10 rounded'>
                    <div className='py-1 flex justify-between items-center'>
                      <h3 className='font-bold text-lg text-[#181818] py-2 '>Experience</h3>
                      <GrFormAdd onClick={()=>setAddExpModal(true)} className='text-xl font-bold text-[#747474] cursor-pointer' title='add your experience' />
                    </div>
                    {expDetails.map((item) => (
                    <div className='bg-white flex gap-4 pt-6 pb-7 rounded-b-[4px] border-b border-solid border-[#F4F4F4]'>
                        <div>
                            <div className='w-14 h-14 rounded-full'>
                                <img className=' w-full h-full rounded-full' src={item.value.companyLogo?item.value.companyLogo:'../images/exp1.png'} />
                            </div>
                        </div>
                        <div className='relative group'>
                            <div>
                                <div>
                                    <h3 className='font-medium text-sm capitalize text-[#181818]'>{item.value.Jobtitle?item.value.Jobtitle:"Freelance UX/UI designer"}</h3>
                                    <div className='flex gap-5 mt-3'>
                                        <p className='text-xs capitalize text-[#181818] '>{item.value.companyName?item.value.companyName:"Self Employed"}</p>
                                        <p className='text-xs capitalize text-[#181818]'>{item.value.workLocation?item.value.workLocation:"Around the world"}</p>
                                    </div>
                                    <div className='flex gap-5 mt-2'>
                                        <p className='text-xs capitalize text-[#181818] '>{item.value.period?item.value.period:"Jun 2016 — Present"}</p>
                                        <p className='font-medium text-xs capitalize text-[#0275B1]'>3 yrs 3 months</p>
                                    </div>
                                </div>
                                <div className='mt-3 text-left '>
                                    <p className='font-regular text-xs text-ellipsis text-[#181818] relative group'>
                                        {item.value.description?item.value.description:"Work with clients and web studios as freelancer.  Work in next areas: eCommerce web projects; creative landing pages; iOs and Android apps; corporate web sites and corporate identity sometimes."}
                                    </p>
                                </div>
                            </div>
                            <MdOutlineDeleteOutline onClick={()=>handleExpDelete(item.key)} className='text-2xl text-[#747474] absolute bottom-0 left-[-56px] opacity-0 group-hover:opacity-100 group-hover:cursor-pointer z-[15] shadow-white' title='delete your experience' />
                        {/* onClick={()=>handleExpDelete(item.key)} */}
                        </div>
                    </div>
                    ))}
                    
                    {/* 
                    <div className='bg-white flex gap-4 py-6 rounded-b-[4px]'>
                        <div>
                            <div className='w-14 h-14 rounded-full'>
                                <img className=' w-full h-full rounded-full' src='../images/exp2.png' />
                            </div>
                        </div>
                        <div className='relative'>
                            <div>
                                <div>
                                    <h3 className='font-medium text-sm capitalize text-[#181818]'>UX/UI designer</h3>
                                    <div className='flex gap-5 mt-3'>
                                        <p className='text-xs capitalize text-[#181818] '>Upwork</p>
                                        <p className='text-xs capitalize text-[#181818]'>International</p>
                                    </div>
                                    <div className='flex gap-5 mt-2'>
                                        <p className='text-xs capitalize text-[#181818] '>Jun 2019 — Present</p>
                                        <p className='font-medium text-xs capitalize text-[#0275B1]'>3 mos</p>
                                    </div>
                                </div>
                                <div className='mt-3 text-left '>
                                    <p className='font-regular text-xs text-ellipsis text-[#181818] relative group'>
                                    New experience with Upwork system. Work in next areas: UX/UI design, graphic design, interaction design, UX research.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div> */}
                    {addExpModal&&
                      <div class="fixed top-0 right-0 z-[101] h-screen drop-shadow-2xl">
                        <div className='relative'>
                        <div class="flex h-screen items-center justify-end">
                          <div class="relative h-[600px] w-[500px] overflow-y-auto rounded-tl-lg rounded-bl-lg bg-white p-5 shadow-all">
                              <div>
                                  <h3 class="mb-8 mt-4 text-center text-3xl font-bold text-primary">Add your experience</h3>
                                  <div>
                                      <div class="mt-4 flex w-full flex-col items-center justify-center">
                                          <input onChange={(e)=>setExpCompanyLogo(e.target.files[0])} type="file" class="w-3/4 border border-solid border-[#0E6795] rounded-sm" />
                                      </div>
                                  </div>
                                  <div class="mt-4 flex w-full flex-col items-center justify-center">
                                      <input onChange={(e)=>setJobtitle(e.target.value)} type="text" placeholder="Job Title" class="w-3/4 p-3 border border-solid border-[#0E6795] rounded-md" value={Jobtitle} />
                                  </div>
                                  <div class="mt-4 flex w-full flex-col items-center justify-center">
                                      <input onChange={(e)=>setCompanyName(e.target.value)} type="text" placeholder="Company Name" class="w-3/4 p-3 border border-solid border-[#0E6795] rounded-md" value={companyName} />
                                  </div>
                                  <div class="mt-4 flex w-full flex-col items-center justify-center">
                                      <input onChange={(e)=>setWorkLocation(e.target.value)} type="text" placeholder="Work Location" class="w-3/4 p-3 border border-solid border-[#0E6795] rounded-md" value={workLocation} />
                                  </div>
                                  <div class="mt-4 flex w-full flex-col items-center justify-center">
                                      <input onChange={(e)=>setPeriod(e.target.value)} type="text" placeholder="period" class="w-3/4 p-3 border border-solid border-[#0E6795] rounded-md" value={period} />
                                  </div>
                                  <div class="mt-4 flex w-full flex-col items-center justify-center">
                                      <input onChange={(e)=>setDescription(e.target.value)} type="text" placeholder="discription" class="w-3/4 p-3 border border-solid border-[#0E6795] rounded-md" value={description} />
                                  </div>
                                  <div class="mt-8 flex w-full items-center justify-center">
                                      <div className='relative w-full text-center'>
                                          <button onClick={handleAddExp} className='bg-[#0E6795] font-bold text-white py-2 px-4 rounded-md'>Add</button>
                                          {addExpErr&&<p className='absolute text-red-500 pl-[70px] top-[-30px]'>{addExpErr}</p>}
                                      </div>
                                  </div>
                              </div>
                          </div>
                        </div>

                          <button class="absolute top-8 right-2 text-[#0E6795]">
                              <GrClose onClick={()=>setAddExpModal(false)} className='text-[#0E6795] text-xl' />
                          </button>
                        </div>
                      </div>  
                    }
                </div>

                <div className='w-full bg-white p-8 mt-10 rounded'>
                    <div className='py-1 flex justify-between items-center'>
                    <h3 className='font-bold text-lg text-[#181818] py-2 '>Education</h3>
                      <BiEdit onClick={()=>setAddEduModal(true)} className='text-xl font-bold text-[#747474] cursor-pointer' title='edit educational qualification' />
                    </div>
                    
                    {eduDetails.map((item) => (
                      <div className='bg-white flex gap-4 py-6 rounded-b-[4px]'>
                        <div>
                            <div className='w-14 h-14 rounded-full mt-2'>
                                <img className=' w-full h-full rounded-full' src={item.value.instLogo?item.value.instLogo:'../images/versitylogo.png'} />
                            </div>
                        </div>
                        <div className='relative'>
                            <h3 className='font-medium text-sm capitalize text-[#181818]'>{item.value.instName}</h3>
                            <div className='mt-3 text-left '>
                                <p className='font-regular text-sm text-ellipsis capitalize text-[#181818] relative group'>
                                <span className='font-semibold'>{item.value.degreeName}</span> in <span className='font-bold'>{item.value.subjectName}</span> with grade of {item.value.grade}
                                </p>
                            </div>
                            <div className='mt-2'>
                                <p className='text-xs font-semibold capitalize text-[#181818] '>{item.value.gradYear}</p>
                            </div>
                            <div className='mt-3 text-left '>
                                <p className='font-regular text-xs text-ellipsis text-[#181818] relative group'>
                                    {item.value.courses}
                                </p>
                            </div>
                        </div>
                    </div>
                    ))}
                    
                    {addEduModal&&
                      <div class="fixed top-0 right-0 z-[101] h-screen drop-shadow-2xl">
                        <div className='relative'>
                        <div class="flex h-screen items-center justify-end">
                          <div class="relative h-[600px] w-[500px] overflow-y-auto rounded-tl-lg rounded-bl-lg bg-white p-5 shadow-all">
                              <div>
                                  <h3 class="mb-6 text-center text-3xl font-bold text-primary">Add your educational qualification</h3>
                                  <div>
                                      <div class="mt-4 flex w-full flex-col items-center justify-center">
                                          <input onChange={(e)=>setInstLogo(e.target.files[0])} type="file" class="w-3/4 border border-solid border-[#0E6795] rounded-sm" />
                                      </div>
                                  </div>
                                  <div class="mt-4 flex w-full flex-col items-center justify-center">
                                      <input onChange={(e)=>setInstName(e.target.value)} type="text" placeholder="your higher educational institute name" class="w-3/4 py-2 px-3 border border-solid border-[#0E6795] rounded-md" value={instName} />
                                  </div>
                                  <div class="mt-4 flex w-full flex-col items-center justify-center">
                                      <input onChange={(e)=>setDegreeName(e.target.value)} type="text" placeholder="your higher degree Name" class="w-3/4 py-2 px-3 border border-solid border-[#0E6795] rounded-md" value={degreeName} />
                                  </div>
                                  <div class="mt-4 flex w-full flex-col items-center justify-center">
                                      <input onChange={(e)=>setSubjectName(e.target.value)} type="text" placeholder="your higher degree subjecct name" class="w-3/4 py-2 px-3 border border-solid border-[#0E6795] rounded-md" value={subjectName} />
                                  </div>
                                  <div class="mt-4 flex w-full flex-col items-center justify-center">
                                      <input onChange={(e)=>setGrade(e.target.value)} type="text" placeholder="your higher degree grade" class="w-3/4 py-2 px-3 border border-solid border-[#0E6795] rounded-md" value={grade} />
                                  </div>
                                  <div class="mt-4 flex w-full flex-col items-center justify-center">
                                      <input onChange={(e)=>setGradYear(e.target.value)} type="text" placeholder="graduation year" class="w-3/4 py-2 px-3 border border-solid border-[#0E6795] rounded-md" value={gradYear} />
                                  </div>
                                  <div class="mt-4 flex w-full flex-col items-center justify-center">
                                      <input onChange={(e)=>setCourses(e.target.value)} type="text" placeholder="additional qualification or taken courses" class="w-3/4 py-2 px-3 border border-solid border-[#0E6795] rounded-md" value={courses} />
                                  </div>
                                  <div class="mt-8 flex w-full items-center justify-center">
                                      <div className='relative w-full text-center'>
                                          <button onClick={handleAddEdu} className='bg-[#0E6795] font-bold text-white py-2 px-4 rounded-md'>Add</button>
                                          {addEduErr&&<p className='absolute text-red-500 pl-[70px] top-[-30px]'>{addEduErr}</p>}
                                      </div>
                                  </div>
                              </div>
                          </div>
                        </div>

                          <button class="absolute top-8 right-2 text-[#0E6795]">
                              <GrClose onClick={()=>setAddEduModal(false)} className='text-[#0E6795] text-xl' />
                          </button>
                        </div>
                      </div>  
                    }
                </div>
            </div>
            )}
            
              {userNameUpdate && (
                <div className='absolute top-[240px] ml-[208px] z-30 bg-[#dadada] w-1/5 rounded-md border border-solid border-[#0E6795] p-1'>
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
                <div className='absolute top-[295px] ml-[208px] z-30 bg-[#dadada] w-2/5 rounded-md border border-solid border-[#0E6795] p-1'>
                  <textarea type='text' onChange={(e)=>{setNewBio(e.target.value); setNewBioErr("")}} className=' w-full p-2 text-center border border-solid' value={newBio?newBio:` ${showNewBio}`} />
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

            <button onClick={getCropData} className='bg-black rounded font-nunito font-semibold text-xl text-white px-8 py-5 mt-3'>Upload</button>
            <button onClick={handleImgUploadModal} className='bg-red-500 rounded font-nunito font-semibold text-xl text-white px-8 py-5 ml-4'>Cancel</button>

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
                  <button onClick={handleBgImageUploadButton} className='bg-green-500 rounded font-nunito font-semibold text-xl text-white p-5'>set image as background</button>
                  <button onClick={()=>{setBgImgUploadModal(false); setImgToUpload(""); setReadyImgToUploadWindow("")}} className='bg-red-500 rounded font-nunito font-semibold text-xl text-white p-5 ml-5'>cancel</button>
              </div>
            </div>
          </div>                     
        )}

    </div>

   </div>
  );
}

export default ProfilePage;
