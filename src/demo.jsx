import React, { useEffect, useRef, useState } from "react";
import { MicrophoneIcon } from "../../svg/MicrophoneIcon";
import { SmileIcon } from "../../svg/SmileIcon";
import { GalleryIcon } from "../../svg/GalleryIcon";
import { useSelector } from "react-redux";
import { getDatabase, set, ref, push, onValue } from "firebase/database";
import { formatDistance } from "date-fns";
import EmojiPicker from "emoji-picker-react";
import { ToastContainer, toast } from "react-toastify";
import CircleLoader from "react-spinners/CircleLoader";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";
import uuid from "react-uuid";
import {
  getStorage,
  ref as Ref,
  uploadBytesResumable,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";

const Chatting = () => {
  const [loading, setLoading] = useState(false);
  const singleFriend = useSelector((single) => single?.active.active);
  const user = useSelector((user) => user.login.isLoggedIn);
  const [messages, setMessages] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [emojiShow, setEmojiShow] = useState(false);
  const [allMessages, setAllMessages] = useState([]);
  const db = getDatabase();
  const storage = getStorage();
  const chooseFile = useRef(null);
  const scrollRef = useRef(null);
  const recorderControls = useAudioRecorder(
    {
      noiseSuppression: true,
      echoCancellation: true,
    },
    (err) => console.table(err) // onNotAllowedOrFound
  );
  const handleSendMessage = () => {
    if (loading) return;
    if (singleFriend?.status == "single" && messages.length > 0) {
      setLoading(true);
      set(push(ref(db, "singleMessage")), {
        whoSendName: user.displayName,
        whoSendId: user.uid,
        whoReceiveName: singleFriend?.name,
        whoReceiveId: singleFriend?.id,
        messages: messages,
        date: `${new Date().getFullYear()}-${
          new Date().getMonth() + 1
        }-${new Date().getDate()}-${new Date().getHours()}:${new Date().getMinutes()}`,
      }).then(() => {
        setMessages("");
        setEmojiShow(false);
        setSelectedImage(null);
        setImageFile(null);
        setLoading(false);
      });
    } else if (singleFriend?.status == "single" && imageFile != null) {
      setLoading(true);
      const storageRef = Ref(
        storage,
        ${user.username} = sendImageMessage/${imageFile}
      );
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.log(error);
          setLoading(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            set(push(ref(db, "singleMessage")), {
              whoSendName: user.displayName,
              whoSendId: user.uid,
              whoReceiveName: singleFriend?.name,
              whoReceiveId: singleFriend?.id,
              messages: messages,
              image: downloadURL,
              date: `${new Date().getFullYear()}-${
                new Date().getMonth() + 1
              }-${new Date().getDate()}-${new Date().getHours()}:${new Date().getMinutes()}`,
            }).then(() => {
              setMessages("");
              setEmojiShow(false);
              setSelectedImage(null);
              setImageFile(null);
              setLoading(false);
            });
          });
        }
      );
    }
  };
  //get messages
  useEffect(() => {
    onValue(ref(db, "singleMessage"), (snapshot) => {
      let singleMessageArray = [];
      snapshot.forEach((item) => {
        if (
          (user.uid == item.val().whoSendId &&
            item.val().whoReceiveId == singleFriend?.id) ||
          (user.uid == item.val().whoReceiveId &&
            item.val().whoSendId == singleFriend?.id)
        ) {
          singleMessageArray.push(item.val());
        }
      });
      setAllMessages(singleMessageArray);
    });
  }, [singleFriend?.id]);
  const handleEmojiSelect = ({ emoji }) => {
    setMessages(messages + emoji);
  };
  const handleImageUpload = (e) => {
    const imgFile = e.target.files[0];
    if (imgFile.size > 3 * 1024 * 1024) {
      toast.error("Image must be less than 3 MB", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }
    setSelectedImage(URL.createObjectURL(imgFile));
    setImageFile(imgFile);
  };
  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);
  const handleSendButton = (e) => {
    if (loading) return;
    if (e.key == "Enter") handleSendMessage();
  };
  const addAudioElement = (blob) => {
    if (loading) return;
    const uid = uuid();
    const url = URL.createObjectURL(blob);
    const audio = document.createElement("audio");
    audio.src = url;
    audio.controls = true;
    const storageRef = Ref(
      storage,
      ${user.username} = sendAudioMessage/${uid}
    );
    const metadata = {
      contentType: "audio/mp3",
    };
    setLoading(true);
    uploadBytes(storageRef, blob, metadata).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadURL) => {
        set(push(ref(db, "singleMessage")), {
          whoSendName: user.displayName,
          whoSendId: user.uid,
          whoReceiveName: singleFriend?.name,
          whoReceiveId: singleFriend?.id,
          messages: messages,
          audio: downloadURL,
          date: `${new Date().getFullYear()}-${
            new Date().getMonth() + 1
          }-${new Date().getDate()}-${new Date().getHours()}:${new Date().getMinutes()}`,
        }).then(() => {
          setMessages("");
          setEmojiShow(false);
          setSelectedImage(null);
          setImageFile(null);
          setLoading(false);
        });
      });
    });
  };
  return (
    <>
      <ToastContainer />
      <div className="w-full h-[95vh] bg-white shadow-md">
        <div className="py-4 h-[10vh] bg-[#F9F9F9] px-6 rounded-md">
          <div className="flex items-center gap-x-2">
            {singleFriend != null && (
              <div className="w-10 h-10 rounded-full bg-[#D9D9D9] overflow-hidden">
                <img
                  src={singleFriend?.profile}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <span className="font-fontInter">
                {singleFriend?.name || "Please select user for chatting"}
              </span>
            </div>
          </div>
        </div>
        <div className="h-[70vh] bg-[#FBFBFB] px-5 py-3 overflow-y-auto scrollbar-thin">
          {singleFriend?.status == "single"
            ? allMessages?.map((item, i) => (
                <div key={i} ref={scrollRef}>
                  {item.whoSendId == user.uid ? (
                    item.audio ? (
                      <div className="w-[30%] ml-auto my-3 overflow-hidden">
                        <audio src={item.audio} controls></audio>
                        <span className="mt-2 text-sm text-slate-500">
                          {formatDistance(item.date, new Date(), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    ) : item.image ? (
                      <div className="w-[30%] ml-auto overflow-hidden">
                        <img
                          src={item.image}
                          alt="image"
                          className="w-full h-full object-cover rounded-md"
                        />
                        <span className="mt-2 text-sm text-slate-500">
                          {formatDistance(item.date, new Date(), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    ) : (
                      <div className="w-[60%] ml-auto flex flex-col items-end">
                        <p className="text-white font-fontInter text-sm bg-slate-500 py-2 px-4 rounded-md inline-block text-right">
                          {item.messages}
                        </p>
                        <span className="mt-2 text-sm text-slate-500">
                          {formatDistance(item.date, new Date(), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    )
                  ) : item.audio ? (
                    <div className="w-[30%] mr-auto my-3 overflow-hidden">
                      <audio src={item.audio} controls></audio>
                      <span className="mt-2 text-sm text-slate-500">
                        {formatDistance(item.date, new Date(), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  ) : item.image ? (
                    <div className="w-[30%] mr-auto my-3 overflow-hidden">
                      <img
                        src={item.image}
                        alt="image"
                        className="w-full h-full object-cover rounded-md"
                      />
                      <span className="mt-2 text-sm text-slate-500">
                        {formatDistance(item.date, new Date(), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  ) : (
                    <div className="w-[60%] mr-auto my-3 flex flex-col items-start">
                      <p className="text-white font-fontInter text-sm bg-cyan-500 py-2 px-4 rounded-md inline-block">
                        {item.messages}
                      </p>
                      <span className="mt-2 text-sm text-slate-500">
                        {" "}
                        {formatDistance(item.date, new Date(), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  )}
                </div>
              ))
            : ""}
        </div>
        {singleFriend != null && singleFriend?.isBlocked && (
          <div className="py-2 h-[10vh">
            <div className="bg-[#F5F5F5] w-[50vw] rounded-md mx-auto py-3 flex items-center justify-center gap-x-3">
              <label className="font-fontInter">This chat is blocked</label>
            </div>
          </div>
        )}
        {singleFriend != null && !singleFriend?.isBlocked && (
          <div className="py-2 h-[10vh">
            <div className="bg-[#F5F5F5] w-[50vw] rounded-md mx-auto py-3 flex items-center justify-center gap-x-3">
              <div className="flex items-center gap-x-2 w-[15%]">
                <div
                  className="cursor-pointer"
                  onClick={() => recorderControls.startRecording()}
                >
                  <MicrophoneIcon />
                </div>
                <div className="relative">
                  <div
                    className="cursor-pointer"
                    onClick={() => setEmojiShow((prev) => !prev)}
                  >
                    <SmileIcon />
                  </div>
                  {emojiShow && (
                    <div className="absolute bottom-8 left-0">
                      <EmojiPicker onEmojiClick={handleEmojiSelect} />
                    </div>
                  )}
                </div>
                <div
                  className="cursor-pointer"
                  onClick={() => chooseFile.current.click()}
                >
                  <GalleryIcon />
                </div>
                <input
                  ref={chooseFile}
                  hidden
                  type="file"
                  accept="image/jpg,image/png,image/jpeg,image/avif"
                  onChange={handleImageUpload}
                />
              </div>
              <input
                placeholder="type here...."
                className="w-[60%] outline-none bg-[#F5F5F5]"
                onChange={(e) => setMessages(e.target.value)}
                value={messages}
                onKeyUp={handleSendButton}
              />
              <div className={!recorderControls.isRecording ? "hidden" : ""}>
                <AudioRecorder
                  onRecordingComplete={(blob) => addAudioElement(blob)}
                  recorderControls={recorderControls}
                  showVisualizer={true}
                />
              </div>
              {selectedImage && (
                <img className="w-12 h-12" src={selectedImage} />
              )}
              <button
                className="bg-[#3E8DEB] px-4 py-2 rounded-md font-fontInter text-sm text-white"
                onClick={handleSendMessage}
              >
                {loading ? <CircleLoader color="#fff" size={20} /> : "Send"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Chatting;