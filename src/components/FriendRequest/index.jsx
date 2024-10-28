import { getDatabase, onValue, push, ref, remove, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Lottie from "lottie-react"; 
import emptyFriends from "../../animations/emptyFriends";

const FriendRequest = () => {
  const [friendReqList, setFriendReqList] = useState([]);
  const user = useSelector((state) => state.login.loggedIn);
  const db = getDatabase();

  useEffect(() => {
    const starCountRef = ref(db, "FriendRequest/");
    onValue(starCountRef, (snapshot) => {
      let frndReq = [];
      snapshot.forEach((item) => {
        if (user.uid === item.val().receiverId) {
          frndReq.push({ ...item.val(), id: item.key });
        }
      });
      setFriendReqList(frndReq);
    });
  }, [db, user.uid]);

  const handleAccept=(data)=>{
    set(push(ref(db,'friends')),{
      ...data
    }).then(()=>{
      remove(ref(db,'FriendRequest/'+data.id))
    })
  }

  const handleReject=(data)=>{
    remove(ref(db,'FriendRequest/'+data.id))
  }

  return (
    <div className="px-8 p-5 shadow-xl rounded-md h-[800px] overflow-y-auto border-stone-500">
      <p className="font-mono text-black text-2xl">Friend Request</p>
      {friendReqList.length === 0 ? (
        <Lottie animationData={emptyFriends} loop={true} />
      ) : (
        friendReqList.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between mt-5 shadow-lg border-2 rounded-lg px-4 py-2"
          >
            <div className="flex items-center gap-x-2">
              <div className="w-10 h-10 bg-purple-600 rounded-full overflow-hidden">
                <img
                  src={item.senderProfile || "https://i.ibb.co/ng7V1Vr/avater.jpg"}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-black font-bold text-lg">{item.senderName}</h3>
            </div>
            <div className="text-white flex items-center gap-x-2">
              <button className="bg-[#3dc55b] shadow-md rounded-md px-4 py-2"onClick={()=>handleAccept(item)}>
                Accept
              </button>
              <button className="bg-[#D34A4A] shadow-md rounded-md px-4 py-2" onClick={()=>handleReject(item)}>
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FriendRequest;
