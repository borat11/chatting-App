import React, { useEffect, useRef, useState } from "react";
import { SmileIcon } from "../../svg/Smile";
import { GalleryIcon } from "../../svg/Gallery";
import { useSelector } from "react-redux";
import { getDatabase, onValue, push, ref, set } from "firebase/database";
import MicrophoneIcon from "../../svg/MicroPhone";
import EmojiPicker from "emoji-picker-react";
import { getStorage, ref as Ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const Chatting = () => {
  // Redux Selectors
  const SingleFriend = useSelector((single) => single.active.active);
  const user = useSelector((state) => state.login.loggedIn);

  // State Variables for Messaging
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [blocking, setBlocking] = useState([]);
  const [emojiShow, setEmojiShow] = useState(false);

  // State Variables for Image Handling
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewURL, setImagePreviewURL] = useState(null);

  // State Variables for Audio Recording
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null); // For audio preview

  // Refs
  const chooseFile = useRef(null);
  const scrollRef = useRef(null);

  // Firebase Instances
  const db = getDatabase();
  const storage = getStorage();

  /**
   * handleSendMessage:
   * Handles sending of messages, which can be text, image, or audio.
   * Prioritizes sending image > audio > text to ensure only one type is sent at a time.
   */
  const handleSendMessage = async () => {
    // Prevent sending if all message types are empty
    if (message.trim() === "" && !audioBlob && !selectedImage) return;

    if (SingleFriend?.status === "single") {
      // Sending Image Message
      if (selectedImage) {
        try {
          const storageRef = Ref(storage, `imageMessages/${user.uid}/${selectedImage.name}`);
          const uploadTask = uploadBytesResumable(storageRef, selectedImage);

          // Monitor upload progress (optional)
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log(`Image Upload is ${progress}% done`);
            },
            (error) => {
              console.error("Error uploading image:", error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              // Send the image message to Realtime Database
              await set(push(ref(db, "singleMessage")), {
                WhoSenderName: user.displayName,
                WhoSenderId: user.uid,
                whoReceiverName: SingleFriend.name,
                whoReceiverId: SingleFriend.id,
                message: "", // No text message
                date: new Date().toISOString(),
                image: downloadURL, // Store the image URL
              });
              console.log("Image uploaded and message sent.");
              // Reset image states
              setSelectedImage(null);
              setImagePreviewURL(null);
            }
          );
        } catch (error) {
          console.error("Failed to send image message:", error);
        }
        return; // Exit after sending image
      }

      // Sending Audio Message
      if (audioBlob) {
        try {
          const storageRef = Ref(storage, `audioMessages/${user.uid}/${Date.now()}.webm`);
          const uploadTask = uploadBytesResumable(storageRef, audioBlob);

          // Monitor upload progress (optional)
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log(`Audio Upload is ${progress}% done`);
            },
            (error) => {
              console.error("Error uploading audio:", error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              // Send the audio message to Realtime Database
              await set(push(ref(db, "singleMessage")), {
                WhoSenderName: user.displayName,
                WhoSenderId: user.uid,
                whoReceiverName: SingleFriend.name,
                whoReceiverId: SingleFriend.id,
                message: "", // No text message
                date: new Date().toISOString(),
                audio: downloadURL, // Store the audio URL
              });
              console.log("Audio uploaded and message sent.");
              // Reset audio states
              setAudioBlob(null);
              setAudioURL(null);
            }
          );
        } catch (error) {
          console.error("Failed to send audio message:", error);
        }
        return; // Exit after sending audio
      }

      // Sending Text Message
      if (message.trim() !== "") {
        try {
          await set(push(ref(db, "singleMessage")), {
            WhoSenderName: user.displayName,
            WhoSenderId: user.uid,
            whoReceiverName: SingleFriend.name,
            whoReceiverId: SingleFriend.id,
            message: message,
            date: new Date().toISOString(),
          });
          setMessage("");
          setEmojiShow(false);
          console.log("Text message sent.");
        } catch (error) {
          console.error("Failed to send text message:", error);
        }
      }
    }
  };

  /**
   * Fetch Messages:
   * Retrieves messages from Firebase Realtime Database in real-time and updates the `allMessages` state.
   */
  useEffect(() => {
    const messageRef = ref(db, "singleMessage");
    const unsubscribe = onValue(messageRef, (snapshot) => {
      const messagesArray = [];
      snapshot.forEach((item) => {
        const data = item.val();
        if (
          (user.uid === data.WhoSenderId && data.whoReceiverId === SingleFriend.id) ||
          (user.uid === data.whoReceiverId && data.WhoSenderId === SingleFriend.id)
        ) {
          messagesArray.push(data);
        }
      });
      // Sort messages by date in ascending order
      messagesArray.sort((a, b) => new Date(a.date) - new Date(b.date));
      setAllMessages(messagesArray);
    });

    return () => {
      unsubscribe();
    };
  }, [SingleFriend?.id, user.uid, db]);

  /**
   * Fetch Blocked Users:
   * Retrieves blocked users from Firebase Realtime Database and updates the `blocking` state.
   */
  useEffect(() => {
    const blockRef = ref(db, "block/");
    const unsubscribe = onValue(blockRef, (snapshot) => {
      const blockArr = [];
      snapshot.forEach((item) => {
        const data = item.val();
        if (user.uid === data.receiverId || user.uid === data.senderId) {
          blockArr.push({ ...data, id: item.key });
        }
      });
      setBlocking(blockArr);
    });

    return () => {
      unsubscribe();
    };
  }, [db, user.uid]);

  /**
   * isBlocked:
   * Determines if either the user has blocked the friend or the friend has blocked the user.
   */
  const isBlocked = () => {
    return blocking.some(
      (blocked) =>
        (blocked.senderId === user.uid && blocked.receiverId === SingleFriend.id) ||
        (blocked.senderId === SingleFriend.id && blocked.receiverId === user.uid)
    );
  };

  /**
   * didUserBlock:
   * Checks if the current user has blocked the SingleFriend.
   */
  const didUserBlock = () => {
    return blocking.some(
      (blocked) => blocked.senderId === user.uid && blocked.receiverId === SingleFriend.id
    );
  };

  /**
   * handleEmojiSelect:
   * Appends the selected emoji to the current message.
   */
  const handleEmojiSelect = ({ emoji }) => {
    setMessage((prev) => prev + emoji);
  };

  /**
   * handleImageUpload:
   * Handles image selection by setting the selected image and generating a preview URL.
   */
  const handleImageUpload = (e) => {
    const imageFile = e.target.files[0];
    if (!imageFile) return;

    const previewURL = URL.createObjectURL(imageFile);
    setSelectedImage(imageFile);
    setImagePreviewURL(previewURL);
  };

  /**
   * Recording Functions:
   * Manage the audio recording process using the MediaRecorder API.
   */

  // Start Recording
  const startRecording = async () => {
    if (!navigator.mediaDevices) {
      console.error("Media Devices API not supported.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      setIsRecording(true);
      setIsPaused(false);
      setAudioChunks([]);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob)); // For audio preview
        console.log("Recorded Audio Blob:", blob);
      };

      recorder.start();
      console.log("Recording started.");
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  // Pause Recording
  const pauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.pause();
      setIsPaused(true);
      console.log("Recording paused.");
    }
  };

  // Resume Recording
  const resumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "paused") {
      mediaRecorder.resume();
      setIsPaused(false);
      console.log("Recording resumed.");
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
      console.log("Recording stopped.");
      // Stop all audio tracks to release the microphone
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
  };

  /**
   * Cleanup:
   * Ensures that the MediaRecorder stops when the component unmounts to free up resources.
   */
  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder]);

  /**
   * Auto-scroll:
   * Automatically scrolls to the latest message when `allMessages` updates.
   */
  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [allMessages]);

  /**
   * handleSendButton:
   * Allows sending messages by pressing the Enter key.
   */
  const handleSendButton = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="py-2 bg-white relative"> {/* 'relative' positioning for conditional elements */}
      {/* Header */}
      <div className="py-1 bg-[#212121] px-4 border-gray-700">
        <div className="flex items-center gap-x-2">
          <div className="w-10 h-10 rounded-full bg-orange-200 overflow-hidden">
            <img
              src={
                SingleFriend.profile || "https://i.ibb.co/ng7V1Vr/avater.jpg"
              }
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="font-mono text-white text-2xl">
            <span>{SingleFriend.name}</span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="h-[570px] w-[1200px] bg-gradient-to-r overflow-hidden from-orange-200 to-purple-200 p-5 overflow-y-auto">
        {SingleFriend?.status === "single" &&
          allMessages.map((item, i) => (
            <div key={i} ref={scrollRef}>
              {item.WhoSenderId === user.uid ? (
                // Sender side
                <div className="w-[60%] ml-auto flex justify-end items-center">
                  <div className="flex flex-row items-center gap-2 ">
                    {/* Sent Image */}
                    {item.image && (
                      <div className="w-[300px] h-[300px] overflow-hidden rounded-md m-2">
                        <img
                          src={item.image}
                          alt="Sent"
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    {/* Sent Message */}
                    {item.message && (
                      <div className="ml-2  justify-end">
                        <div className="chat chat-end">
                          <div className="chat-bubble chat-bubble-primary">
                        <p className="text-white font-mono text-2xl  m-2 rounded-md inline-block break-words max-w-full">
                          {item.message}
                        </p>
                        </div></div>
                        {/* Add Date */}
                        <p className="text-gray-500 text-sm flex justify-end">
                          {new Date(item.date).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {/* Sent Audio */}
                    {item.audio && (
                      <div className="mt-2 flex flex-col items-end">
                        <audio controls src={item.audio}></audio>
                        <p className="text-gray-500 text-sm">
                          {new Date(item.date).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Receiver side
                <div className="w-[60%] mr-auto flex justify-start items-center">
                  <div className="flex flex-row items-center gap-2">
                    {/* Receiver's Profile Image */}
                    <div className="w-[40px] h-[40px] overflow-hidden rounded-full">
                      <img
                        src={
                          SingleFriend.profile ||
                          "https://i.ibb.co/ng7V1Vr/avater.jpg"
                        }
                        alt="Receiver Avatar"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    {/* Received Message or Image */}
                    {item.image ? (
                      <div className="w-[300px] h-[300px] overflow-hidden rounded-md m-2">
                        <img
                          src={item.image}
                          alt="Received"
                          className="object-cover w-full h-full"
                        />
                        <p className="text-gray-500 text-sm">
                          {new Date(item.date).toLocaleString()}
                        </p>
                      </div>
                    ) : item.audio ? (
                      <div className="mt-2 flex flex-col items-start">
                        <audio controls src={item.audio}></audio>
                        <p className="text-gray-500 text-sm">
                          {new Date(item.date).toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <div className="">
                        <div className="chat chat-start">
                          <div className="chat-bubble chat-bubble-info">
                        <p className="text-white font-mono text-2xl  m-2 rounded-md inline-block break-words max-w-full">
                          {item.message}
                        </p>
                        </div></div>
                        {/* Add Date */}
                        <p className="text-gray-500 text-sm">
                          {new Date(item.date).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Image Preview */}
      {selectedImage && (
        <div className="absolute bottom-24 left-4 bg-gray-200 p-4 rounded-md flex items-center gap-4">
          <img src={imagePreviewURL} alt="Selected" className="w-32 h-32 object-cover rounded-md" />
          <button
            onClick={() => {
              setSelectedImage(null);
              setImagePreviewURL(null);
            }}
            className="text-red-500 font-bold"
          >
            Remove
          </button>
          <button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Send Image
          </button>
        </div>
      )}

      {/* Audio Preview */}
      {audioURL && (
        <div className="absolute bottom-24 left-4 bg-gray-200 p-4 rounded-md flex items-center gap-4">
          <audio controls src={audioURL}></audio>
          <button
            onClick={() => {
              setAudioBlob(null);
              setAudioURL(null);
            }}
            className="text-red-500 font-bold"
          >
            Remove
          </button>
          <button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Send Audio
          </button>
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="absolute bottom-20 left-4 bg-red-500 text-white px-4 py-2 rounded-md flex items-center gap-2">
          <span>Recording... {isPaused ? "(Paused)" : ""}</span>
          {!isPaused ? (
            <button onClick={pauseRecording} className="text-yellow-300 font-bold">
              Pause
            </button>
          ) : (
            <button onClick={resumeRecording} className="text-green-300 font-bold">
              Resume
            </button>
          )}
          <button onClick={stopRecording} className="text-white font-bold">
            Stop
          </button>
        </div>
      )}

      {/* Blocked User Message */}
      {isBlocked() ? (
        didUserBlock() ? (
          <div className="text-center text-red-500 text-2xl my-4">
            You blocked this user
          </div>
        ) : (
          <div className="text-center text-red-500 text-2xl my-4">
            You are blocked
          </div>
        )
      ) : (
        /* Input Section */
        <div className="bg-[#F5F5F5] py-6 flex justify-center">
          <div className="bg-white rounded-3xl w-[1000px] py-3 flex items-center justify-between shadow-md relative">
            {/* Conditional Rendering for Image and Audio Previews */}
            {!selectedImage && !audioURL && (
              <div className="flex items-center justify-center gap-2 w-[15%] text-[#292D32]">
                {/* Microphone Section */}
                <div className="flex items-center">
                  {!isRecording ? (
                    <div onClick={startRecording} className="cursor-pointer">
                      <MicrophoneIcon />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {!isPaused ? (
                        <button onClick={pauseRecording} className="text-yellow-500 font-bold">
                          Pause
                        </button>
                      ) : (
                        <button onClick={resumeRecording} className="text-green-500 font-bold">
                          Resume
                        </button>
                      )}
                      <button onClick={stopRecording} className="text-red-500 font-bold">
                        Stop
                      </button>
                    </div>
                  )}
                </div>

                {/* Emoji Picker */}
                <div className="relative">
                  {emojiShow && (
                    <div className="absolute bottom-12 left-0 z-50">
                      <EmojiPicker onEmojiClick={handleEmojiSelect} />
                    </div>
                  )}
                  <div onClick={() => setEmojiShow((prev) => !prev)} className="cursor-pointer">
                    <SmileIcon />
                  </div>
                </div>

                {/* Gallery Icon */}
                <div onClick={() => chooseFile.current.click()} className="cursor-pointer">
                  <GalleryIcon />
                </div>
                <input
                  ref={chooseFile}
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            )}

            {/* Message Input */}
            {!selectedImage && !audioURL && (
              <input
                placeholder="Type something..."
                className="px-5 py-4 border-gray-300 outline-none w-[60%] text-2xl bg-white"
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                onKeyUp={handleSendButton}
              />
            )}

            {/* Send Button */}
            {!selectedImage && !audioURL && (
              <div className="w-[15%]">
                <button
                  className="bg-[#4A81D3] px-10 py-5 text-lg font-serif rounded-2xl text-white"
                  onClick={handleSendMessage}
                >
                  Send
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatting;
