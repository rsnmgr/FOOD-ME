import {  useState,useContext,useEffect } from 'react'
/* React Icons */
import { GiHamburgerMenu } from "react-icons/gi";
import DropDown from './DropDown';
/* Import Default Image */
import { LoginContext } from '../../ContextProvider/Context';
const API_URL = import.meta.env.VITE_API_URL;

export default function Header({toggleSidebar,profileClick,profile,title,handlePageChange}) {
  const {loginData} = useContext(LoginContext)
  const [userData, setUserData] = useState(null);
  const userId = loginData?.validUser?._id;
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (userId) {
          const res = await fetch(`${API_URL}/api/fetchsuper/${userId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          if (res.ok) {
            const data = await res.json();
            setUserData(data.supper);
          } else {
            console.error("Error fetching user data");
          }
        }
      } catch (error) {
        console.error("Fetch user data failed", error);
      }
    };
    fetchUserData();
  }, [userId]);
  
  return (
    <div>
      <div className='flex justify-between items-center'>
        <div className='flex items-center space-x-3'>
            <GiHamburgerMenu size={20} onClick={toggleSidebar}  className='cursor-pointer'/>
            <h1 >{title}</h1>
        </div>
        <div onClick={profileClick} className='cursor-pointer'>
            {userData && userData.image ? (
              <img src={`${API_URL}/${userData.image}`} alt="" className='w-6 h-6 rounded-full border  border:bg-gray-400 object-cover'/>
              ) : (
                <h1 className="w-6 h-6 flex justify-center items-center rounded-full object-cover bg-blue-600 text-white font-bold border border-gray-400">
                  {userData?.name?.[0]}
                </h1>
            )}
        </div>
      </div>
      {profile &&(
      <div className='absolute  right-0 top-0 bg-gray-900 h-screen border-l border-gray-600 rounded-l-2xl p-4 z-50'>
        <DropDown profileClick={profileClick} handlePageChange={handlePageChange} userData={userData}/>
      </div>
      )}
    </div>
  )
}
