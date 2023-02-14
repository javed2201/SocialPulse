import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {HiOutlinePhotograph, } from 'react-icons/hi'
import {BiDotsHorizontalRounded, } from 'react-icons/bi'
import {FiSend, } from 'react-icons/fi'
import {AiFillCloseCircle, AiOutlineDelete} from 'react-icons/ai'
import {RiAttachmentLine} from 'react-icons/ri'
import { RotatingSquare, Watch } from  'react-loader-spinner'
import { getDatabase, ref, set, push, onValue, update, remove } from "firebase/database";
import { getStorage, ref as sref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const Posts = () => {
    let data = useSelector((state) => state.userLoginInfo.userInfo)
    let dispatch = useDispatch()
    let db = getDatabase()
    const storage = getStorage();
  
    let [postText, setPostText] = useState("")
    let [postTextErr, setPostTextErr] = useState("")
    let [postList, setPostList] = useState([])
    let [postImg, setPostImg] = useState('')
    let [showPostEditbox, setShowPostEditbox] = useState(false)
    let [imgUploading, setImgUploading] = useState(false)
    let [seeImg, setSeeImg] = useState(false)
    let [seeImgImage, setSeeImgImage] = useState("")

    let [postKeys, setPostKeys] = useState([])
    
    let [editPostModal, setEditPostModal] = useState(false)
    let [clickedPost, setClickedPost] = useState()
    let [clickPostKey, setClickPostKey] = useState()
    const [editPostImg, setEditPostImg] = useState();
    const [editPostImgPreview, setEditPostImgPreview] = useState();
    const [showEditPostText, setShowEditPostText] = useState();
    const [postUploadLoading, setPostUploadLoading] = useState(false);
    const [deletePostLoading, setDeletePostLoading] = useState(false);
  
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

    let handlePostText = (e)=>{
      setPostText(e.target.value)
      setPostTextErr("")
    }
  
    let handlePostImg = (e) =>{
        setImgUploading(true)
        setPostImg("")
        setSeeImgImage(URL.createObjectURL(e.target.files[0]))
        const storageRef = sref(storage, `Imgmsg/${e.target.files[0].name}`);
        const uploadTask = uploadBytesResumable(storageRef, e.target.files[0]);
    
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
              console.log('File available at', downloadURL);
              setPostImg(downloadURL)
              
            }).then(()=>{
                setImgUploading(false)
            });
          }
        );
      }

    let handlePost = ()=>{
      if(!postText && !postImg){
        setPostTextErr("* please write something")
      } else if(!postImg) {
        setPostUploadLoading(true)
        set(push(ref(db, 'posts')), {
          senderid: data.uid,
          sendername: data.displayName,
          senderphotoURL: data.photoURL,
          posttext: postText,
        })
        .then(()=>{
          setTimeout(()=>{
            setPostUploadLoading(false)
            setPostText("")
          }, 1000)
          
          })
      } else if(!postText) {
        setPostUploadLoading(true)
        set(push(ref(db, 'posts')), {
          senderid: data.uid,
          sendername: data.displayName,
          senderphotoURL: data.photoURL,
          postimg: postImg,
        })
        .then(()=>{
          setTimeout(()=>{
            setPostUploadLoading(false)
            setPostImg("")
          }, 1000)
          })
      } 
      else{
        setPostUploadLoading(true)
        set(push(ref(db, 'posts')), {
          senderid: data.uid,
          sendername: data.displayName,
          senderphotoURL: data.photoURL,
          posttext: postText,
          postimg: postImg,
        }).then(()=>{
          setTimeout(()=>{
            setPostUploadLoading(false)
            setPostText("")
            setPostImg("")
          }, 1000)
          })
      }
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
    setDeletePostLoading(true)
    remove(ref(db, "posts/" + clickPostKey)).then(()=>{
      setTimeout(()=>{
        setDeletePostLoading(false)
        setClickPostKey("");
        setEditPostModal(false); 
        setEditPostImg(""); 
        setEditPostImgPreview(""); 
      }, 2000)
    })
  }
  
  const [editPostText, setEditPostText] = useState(showEditPostText);
  return (
    <>
    {seeImg ?(
        <div className='absolute w-full h-screen flex justify-center items-center bg-[#0E6795] z-50 top-0 left-0'>
            <div className='relative flex justify-center items-center'>
                <img className='w-auto h-[600px] pt-5 pb-6 px-8' src={seeImgImage} />
                <AiFillCloseCircle onClick={()=>setSeeImg(false)} className='font-bold text-red-500 absolute bottom-2 w-6 h-6 z-50' />
            </div>
        </div>
    ): !editPostModal ?(
    <div className='py-6 '>
        <div className='flex mt-3 gap-x-3 mb-9 bg-white '>
            <div className='w-full relative'>
                <div className='mx-7 border-b border-solid border-[#F4F4F4]'>
                    <h3 className='pt-5 pb-4 font-medium text-xs text-[#181818]'>NEW POST</h3>
                </div>
                {postUploadLoading?
                <div className='relative w-full h-[64px] my-2'>
                  <div className='absolute bottom-[0px] right-6'>
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
                <div className='relative mx-7 py-7'>
                    <input onChange={handlePostText} className=' w-full outline-none pr-[76px] sm:pr-0' placeholder='what is on your mind?' value={postText} />
                    <div className='w-8 h-8 absolute top-6 right-0 border border-solid bg-[#0E6795] rounded-md flex flex-col justify-center'>
                        <FiSend onClick={handlePost} cursor='pointer' className='mx-auto text-white' />
                    </div>
                      <div>
                        {!imgUploading?
                        (
                        <label>
                          <input onChange={handlePostImg} type='file' className='hidden' />
                        <HiOutlinePhotograph className='absolute w-6 h-6 top-7 right-12 text-[rgba(0,0,0,.25)] cursor-pointer' title='select an image to post' />
                        </label>
                        )
                        :
                        (<>  
                        <div className='absolute top-[20px] right-[40px]'>
                            <RotatingSquare
                            height="40"
                            width="40"
                            color="#0E6795"
                            ariaLabel="rotating-square-loading"
                            strokeWidth="4"
                            wrapperStyle={{}}
                            wrapperClass=""
                            visible={true}
                        />
                        </div>
                        <p className='absolute top-[52px] right-[52px] text-xs text-red-500'>image loading</p>
                        </>)}  
                        {postImg && 
                          <div>
                            <p onClick={()=>setSeeImg(true)} className='absolute top-[52px] right-[51px] text-xs text-blue-500 underline flex justify-between cursor-pointer' title='check selected image' ><RiAttachmentLine className='mt-1 mr-1' /> image ready to post </p>
                            <AiOutlineDelete onClick={()=>{setSeeImgImage(""); setPostImg("")}} className='absolute top-[55px] right-[34px] w-3 h-3 text-red-500 cursor-pointer' title='delete selected image' />
                          </div>
                        }
                      </div>
                </div>
              }
                {postTextErr && (
                    <div className='absolute bottom-[-23px] left-4'>
                        <p className=' text-red-500'>{postTextErr}</p>
                    </div>
                )}  
            </div>
        </div>
        {postList.map((item, index)=>(
            <div className='w-full min-h-[185px] md:min-h-[233px] bg-white inline-block py-3 relative mb-8'>
            <div className='relative'>
              <div className='pb-3 box-content border-b border-solid border-[#F4F4F4] flex justify-end'>
                  <BiDotsHorizontalRounded value={data.id} onClick={((e) => {handleClick(e, data, index, item); setShowPostEditbox(!showPostEditbox)})} className='mr-4 ' />
                  {(showPostEditbox&&item==clickedPost) && <button onClick={()=>{clickedPost.senderid==data.uid?handlePostEdit():setShowPostEditbox(false)}} className='absolute top-[12px] right-[15px] bg-[#e5e7eb] text-[#5a5a5a] py-[1px] px-[9px] font-semibold border border-solid border-[#5a5a5a] rounded-[6px] ' >{clickedPost.senderid==data.uid?"edit":"edit allowed for owner only!"}</button>} 
                  {/*  */}
              </div>
            </div>
            
            <div className='py-4 px-4 md:px-8'>
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
           {!deletePostLoading?
           <div className='relative mt-3'>
               <button onClick={handleEditPostImageButton} className='bg-[#0E6795] rounded-lg font-nunito font-semibold text-xl text-white py-3 px-5'>post this update</button>
               <button onClick={()=>{setEditPostModal(false); setEditPostImg(""); setEditPostImgPreview(""); setClickedPost(""); setClickPostKey("")}} className='bg-[#e70101] rounded-lg font-nunito font-semibold text-xl text-white py-3 px-5 ml-5'>cancel</button>
               <button onClick={()=>{setClickedPost(""); handleDeletePost()}} className='bg-[#e70101] rounded-lg font-nunito font-semibold text-xl text-white py-3 px-5 ml-5'>delete</button>
           </div>
           :
           <div className='relative w-full h-[52px] mt-2 mb-1'>
                <div className='absolute bottom-[0px] right-[220px]'>
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
       </div>
       
     </div>                     
   )}
    
        {/* {editPostModal && (
           <div className='absolute top-0 left-0 w-full h-screen bg-primary z-50 flex justify-center items-center bg-black '>
            <div className='bg-white p-5 rounded text-center flex justify-center items-center'>
              
              <div className='bg-[#dadada] w-2/5 h-[513px] rounded-md border border-solid border-[#0E6795] p-1'>
                  <textarea type='text' onChange={(e)=>setEditPostText(e.target.value)} className='h-full w-full p-2 text-center border border-solid ' value={editPostText?editPostText:` ${showEditPostText}`} />
                  <div className='flex justify-between mt-1'>
                  </div>
              </div>

              <div className='bg-white p-5 rounded text-center '>
                <h3 className='font-nunito font-bold text-4xl text-heading'>
                add or edit image of the post
                </h3>
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
                    <button onClick={handleEditPostImageButton} className='bg-green-500 rounded font-nunito font-semibold text-xl text-white p-5'>spost this update</button>
                    <button onClick={()=>{setEditPostModal(false); setEditPostImg(""); setEditPostImgPreview("")}} className='bg-red-500 rounded font-nunito font-semibold text-xl text-white p-5 ml-5'>cancel</button>
                </div>
              </div>
            </div>
            
          </div>                     
        )} */}
    </>
  )
}

export default Posts