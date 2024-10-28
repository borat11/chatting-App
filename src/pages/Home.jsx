import FriendRequest from '../components/FriendRequest'
import Friends from '../components/Friends'
import UserList from '../components/Userlist'

const Home = () => {
  return (
    <>
    <div className='grid grid-cols-1 md:grid-cols-[1fr,2fr] w-full'>
      <div className='bg-teal-100'>
        <UserList />
      </div>
      <div className='w-full bg-white grid grid-cols-1 sm:grid-cols-2 gap-y-2 sm:gap-x-2 px-2'>
        <div><FriendRequest /></div>
        <div><Friends /></div>
      </div>
    </div>
    </>
  )
}

export default Home;
