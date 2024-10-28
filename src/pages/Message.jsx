import { useSelector } from "react-redux";
import Chatting from "../components/Chatting";
import Friends from "../components/Friends";

const Message = () => {
  const SingleFriend = useSelector((single) => single.active.active);
  console.log("🚀 ~ Message ~ SingleFriend:", SingleFriend)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 p-4 h-[80vh] lg:h-[800px] bg-gray-50">
      
      {/* Friends List */}
      <div className="bg-teal-100 overflow-hidden h-full lg:h-auto">
        <Friends />
      </div>
      
      {/* Chatting Section */}
      {SingleFriend ? (
        <div className="bg-white overflow-hidden h-full lg:h-auto">
          <Chatting />
        </div>
      ) : (
        <div className="flex flex-col bg-gray-200 items-center justify-center h-full px-[500px] text-center p-8 rounded-lg shadow-lg ">
          <h2 className="text-3xl font-semibold text-gray-700">Select a Friend</h2>
          <p className="text-gray-500 text-lg mt-2">
            Choose a friend from the list to start chatting!
          </p>
        </div>
      )}
    </div>
  );
  
};

export default Message;
