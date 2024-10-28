import Chatting from "../components/Chatting";
import Friends from "../components/Friends";

const Message = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 p-4 h-[80vh] lg:h-[800px] bg-gray-50">
      
      {/* Friends List for small, medium, and large devices */}
      <div className="bg-teal-100 overflow-hidden h-full lg:h-auto">
        <Friends />
      </div>
      
      {/* Chatting section for mid and large screens */}
      <div className="bg-white overflow-hidden h-full lg:h-auto">
        <Chatting />
      </div>
    </div>
  );
};

export default Message;
