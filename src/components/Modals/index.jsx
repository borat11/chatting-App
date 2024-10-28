import React, { useRef, useState } from "react";
import { CrossIcon } from "../../svg/Cross";
import { UploadIcon } from "../../svg/Upload";
import ImageCropper from "../ImageCropper";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadString,
} from "firebase/storage";
import { useDispatch, useSelector } from "react-redux";
import { loggedInUsers } from "../../features/slice/LoginSlice";
import { getAuth, updateProfile } from "firebase/auth";

const Modals = ({ setShow }) => {
  const user = useSelector((user) => user.login.loggedIn);
  const storage = getStorage();
  const storageRef = ref(storage, user.uid);
  const dispatch = useDispatch()
  const auth = getAuth();

  const [image, setImage] = useState();
  const [cropData, setCropData] = useState("#");
  const cropperRef = useRef();
  const fileRef = useRef(null);
  const handleChange = (e) => {
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
      / Update the image state/;
    };
    reader.readAsDataURL(files[0]);
  };
  const getCropData = () => {
    if (typeof cropperRef.current?.cropper !== "undefined") {
      setCropData(cropperRef.current?.cropper.getCroppedCanvas().toDataURL());
    }
    const message4 = cropperRef.current?.cropper.getCroppedCanvas().toDataURL();
    uploadString(storageRef, message4, "data_url").then((snapshot) => {
      getDownloadURL(storageRef).then((downloadURL) => {
        updateProfile(auth.currentUser, {
          photoURL: downloadURL
        }).then(() => {
          dispatch(loggedInUsers({...user,photoURL:downloadURL}))
          localStorage.setItem("user",JSON.stringify({...user,photoURL:downloadURL}))
        })
        setShow(false) ;
      });
    });
  };
  return (
    <>
      <div className="fixed top-0 left-0 w-full h-screen bg-[#2e2e2ef0] flex items-center justify-center">
        <div className="w-[30%] bg-white p-4 rounded-md">
          <div className="relative">
            <h1 className="font-serif text-base text-center">Upload image</h1>
            <div
              onClick={() => setShow(false)}
              className="absolute top-0 right-2 text-black cursor-pointer hover:text-red-600"
            >
              <CrossIcon />
            </div>
          </div>
          <div className="w-full border border-slate-400 rounded-md h-[200px] mt-5 p-2 box-border cursor-pointer">
            <div
              onClick={() => fileRef.current.click()}
              className="bg-stone-200 rounded-md w-full h-full flex items-center justify-center "
            >
              <div>
                <div className="flex justify-center ">
                  <UploadIcon />
                </div>
                <h4 className="flex justify-center ">
                  Click here to upload your image
                </h4>
                <input
                  type="file"
                  ref={fileRef}
                  hidden
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>
        {image && (
          <ImageCropper
            image={image}
            setImage={setImage}
            cropperRef={cropperRef}
            getCropData={getCropData}
          />
        )}
      </div>
    </>
  );
};

export default Modals;
