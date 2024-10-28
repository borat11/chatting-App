import {
  getDatabase,
  onValue,
  push,
  ref,
  remove,
  set,
} from "firebase/database";
import { AddFriendIcon } from "../../svg/AddFriend";
import { useSelector } from "react-redux";
import { getDownloadURL, getStorage, ref as Ref } from "firebase/storage";
import { useEffect, useState } from "react";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [friendReqList, setFriendReqList] = useState([]);
  const [cancelReq, setCancelReq] = useState([]);
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); 
  const user = useSelector((state) => state.login.loggedIn);
  const db = getDatabase();
  const storage = getStorage();

  useEffect(() => {
    const starCountRef = ref(db, "users/");
    onValue(starCountRef, (snapshot) => {
      const users = [];
      snapshot.forEach((UserList) => {
        if (user.uid !== UserList.key) {
          getDownloadURL(Ref(storage, UserList.key))
            .then((downloadURL) => {
              users.push({
                ...UserList.val(),
                id: UserList.key,
                photoURL: downloadURL,
              });
            })
            .catch((error) => {
              users.push({
                ...UserList.val(),
                id: UserList.key,
                photoURL: null,
              });
            })
            .finally(() => {
              setUsers([...users]);
            });
        }
      });
    });
  }, [db, user.uid, storage]);

  const handleFriendRequest = (data) => {
    set(push(ref(db, "FriendRequest")), {
      senderName: user.displayName,
      senderId: user.uid,
      senderProfile: user.photoURL ?? "https://i.ibb.co/ng7V1Vr/avater.jpg",
      receiverName: data.username,
      receiverId: data.id,
      receiverProfile: data.photoURL ?? "https://i.ibb.co/ng7V1Vr/avater.jpg",
    });
  };

  useEffect(() => {
    const starCountRef = ref(db, "FriendRequest/");
    onValue(starCountRef, (snapshot) => {
      let reqArr = [];
      let cancelReq = [];
      snapshot.forEach((item) => {
        reqArr.push(item.val().receiverId + item.val().senderId);
        cancelReq.push({ ...item.val(), id: item.key });
      });
      setFriendReqList(reqArr);
      setCancelReq(cancelReq);
    });
  }, [db]);

  useEffect(() => {
    const starCountRef = ref(db, "friends/");
    onValue(starCountRef, (snapshot) => {
      let frndArr = [];
      snapshot.forEach((item) => {
        if (
          user.uid === item.val().receiverId ||
          user.uid === item.val().senderId
        ) {
          frndArr.push({ ...item.val(), id: item.key });
        }
      });
      setFriends(frndArr);
    });
  }, [db, user.uid]);

  const handleCancelReq = (itemId) => {
    const reqToCancel = cancelReq.find(
      (req) => req.receiverId === itemId && req.senderId === user.uid
    );
    if (reqToCancel) {
      remove(ref(db, "FriendRequest/" + reqToCancel.id));
    }
  };

  const isFriend = (itemId) => {
    return friends.some(
      (friend) =>
        (friend.senderId === user.uid && friend.receiverId === itemId) ||
        (friend.senderId === itemId && friend.receiverId === user.uid)
    );
  };

  // Filter users based on the search term
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-14 pt-3 overflow-y-auto h-[800px] ">
      <h1 className="font-mono text-black text-3xl">All Users</h1>
      <input
        type="search"
        className="flex items-center justify-between mt-5 shadow-md rounded-lg px-4 py-3 border-2 bg-white outline-none w-full"
        placeholder="Search here"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} 
      />
      {filteredUsers.length > 0 ? (
        filteredUsers.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between mt-5 shadow-md rounded-lg px-4 py-2 border-2 bg-white"
          >
            <div className="flex items-center gap-x-2">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img
                  src={item.photoURL || "https://i.ibb.co/ng7V1Vr/avater.jpg"}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-black font-bold text-lg">{item.username}</h3>
            </div>
            {isFriend(item.id) ? (
              <button className="text-white bg-green-400 rounded-md py-2 px-4">
                Friends
              </button>
            ) : friendReqList.includes(item.id + user.uid) ||
              friendReqList.includes(user.uid + item.id) ? (
              <div>
                {cancelReq.some(
                  (req) => req.senderId === user.uid && req.receiverId === item.id
                ) ? (
                  <button
                    className="text-white cursor-pointer bg-red-600 rounded-md py-2 px-4"
                    onClick={() => handleCancelReq(item.id)}
                  >
                    Cancel
                  </button>
                ) : (
                  <span className="text-gray-500">Pending Request</span>
                )}
              </div>
            ) : (
              <div
                className="text-black cursor-pointer"
                onClick={() => handleFriendRequest(item)}
              >
                <AddFriendIcon />
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 mt-5">Nothing is found</p>
      )}
    </div>
  );
};

export default UserList;
