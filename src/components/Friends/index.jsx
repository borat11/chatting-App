import { getDatabase, onValue, push, ref, remove, get } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { ActiveSingle, NonActiveSingle } from "../../features/slice/ActiveSingleSlice";

const Friends = () => {
  const user = useSelector((state) => state.login.loggedIn);
  const SingleFriend = useSelector((single) => single.active.active);
  const location = useLocation();
  const navigate = useNavigate();
  const db = getDatabase();
  const [friends, setFriend] = useState([]);
  const dispatch = useDispatch();
  const [blocking, setBlocking] = useState([]);
  const [allMessages, setAllMessages] = useState([]);

  

  useEffect(() => {
    const starCountRef = ref(db, "friends/");
    onValue(starCountRef, (snapshot) => {
      let frndArr = [];
      snapshot.forEach((item) => {
        if (
          user?.uid === item.val().receiverId ||
          user?.uid === item.val().senderId
        ) {
          frndArr.push({ ...item.val(), id: item.key });
        }
      });
      setFriend(frndArr);
    });
  }, [db, user?.uid]);

  

  const handleUnfriend = async (data) => {
    const confirmUnfriend = window.confirm(
      "Unfriending this user will not delete your chat history. If you become friends again, your data will be restored. Do you want to proceed?"
    );
    
    if (confirmUnfriend) {
      // Proceed with unfriending

      try {
        await remove(ref(db, "friends/" + data.id));
        alert("You have unfriended this user.");
        dispatch(NonActiveSingle())
        navigate("/")
        // Optionally, you can notify the other user they are no longer friends by saving this info in the database or using other notifications.
      } catch (error) {
        console.error("Error unfriending user:", error);
        alert("There was an error unfriending the user. Please try again.");
      }
    }
  };
  

  const handleSingleChat = (data) => {
    const isReceiver = user?.uid === data.receiverId;
    const id = isReceiver ? data.senderId : data.receiverId;
    const name = isReceiver ? data.senderName : data.receiverName;
    const profile = isReceiver ? data.senderProfile : data.receiverProfile;

    dispatch(
      ActiveSingle({
        status: "single",
        id,
        name,
        profile
      })
    );

    localStorage.setItem(
      "active",
      JSON.stringify({ status: "single", id, name, profile })
    );
    navigate("/message");
  };

  const handleBlock = async (data) => {
    const friendId = user?.uid === data.receiverId ? data.senderId : data.receiverId;
    if (isFriendBlocked(friendId)) {
      await handleUnblock(friendId);
    } else {
      try {
        await push(ref(db, "block"), {
          senderId: user?.uid,
          receiverId: friendId
        });
      } catch (error) {
        console.error("Error blocking user:", error);
      }
    }
  };

  const handleUnblock = async (friendId) => {
    const blockRef = ref(db, "block/");
    try {
      const snapshot = await get(blockRef);
      snapshot.forEach((item) => {
        const blockData = item.val();
        if (
          (blockData.senderId === user?.uid && blockData.receiverId === friendId) ||
          (blockData.senderId === friendId && blockData.receiverId === user?.uid)
        ) {
          remove(ref(db, "block/" + item.key));
        }
      });
    } catch (error) {
      console.error("Error unblocking user:", error);
    }
  };

  const isFriendBlocked = (friendId) => {
    return blocking.some(
      (blocked) =>
        (blocked.senderId === user?.uid && blocked.receiverId === friendId) ||
        (blocked.senderId === friendId && blocked.receiverId === user?.uid)
    );
  };

  const didUserBlock = (friendId) => {
    return blocking.some(
      (blocked) => blocked.senderId === user?.uid && blocked.receiverId === friendId
    );
  };

  useEffect(() => {
    const starCountRef = ref(db, "block/");
    onValue(starCountRef, (snapshot) => {
      let blockArr = [];
      snapshot.forEach((item) => {
        if (
          user?.uid === item.val().receiverId ||
          user?.uid === item.val().senderId
        ) {
          blockArr.push({ ...item.val(), id: item.key });
        }
      });
      setBlocking(blockArr);
    });
  }, [db, user?.uid]);

  return (
    <>
      <div className="p-5 shadow-xl rounded-md h-[800px] overflow-y-auto">
        <p className="font-mono text-black text-2xl">All Friends</p>

        {friends?.length > 0 ? friends?.map((item) => {
          const friendId = user?.uid === item.receiverId ? item.senderId : item.receiverId;
          const isBlocked = isFriendBlocked(friendId);
          const isBlockInitiatedByUser = didUserBlock(friendId);

          return (
            <div
              key={item.id}
              className="flex items-center justify-between mt-5 shadow-lg border-2 rounded-lg px-4 py-2 bg-white hover:bg-[#efefef]"
              onClick={
                location.pathname === "/message"
                  ? () => handleSingleChat(item)
                  : () => {}
              }
            >
              <div className="flex items-center gap-x-2">
                <div className="w-10 h-10  rounded-full overflow-hidden">
                  <img
                    src={
                      user?.uid === item.receiverId
                        ? item.senderProfile || "https://i.ibb.co/ng7V1Vr/avater.jpg"
                        : item.receiverProfile || "https://i.ibb.co/ng7V1Vr/avater.jpg"
                    }
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3
                  onClick={() => handleSingleChat(item)}
                  className={`text-black font-bold text-lg ${
                    location.pathname === "/"
                      ? "hover:underline hover:text-blue-700 cursor-pointer"
                      : ""
                  }`}
                >
                  {user?.uid === item.senderId ? item.receiverName : item.senderName}
                </h3>
              </div>

              <div className="text-white flex items-center gap-x-2">
                <button
                  className={`bg-[#4A81D3] shadow-md rounded-md px-6 py-2 ${
                    isBlockInitiatedByUser ? "" : isBlocked ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={(e) => { e.stopPropagation(); handleUnfriend(item); }}
                  disabled={isBlocked && !isBlockInitiatedByUser}
                >
                  Unfriend
                </button>

                <button
                  className={`bg-[#D34A4A] shadow-md rounded-md px-6 py-2 ${
                    isBlockInitiatedByUser ? "" : isBlocked ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={(e) => { e.stopPropagation(); handleBlock(item); }}
                  disabled={isBlocked && !isBlockInitiatedByUser}
                >
                  {isBlockInitiatedByUser ? "Unblock" : isBlocked ? "Blocked" : "Block"}
                </button>
              </div>
            </div>
          );
        }) : <p>No friends found.</p>}
      </div>
    </>
  );
};

export default Friends;
