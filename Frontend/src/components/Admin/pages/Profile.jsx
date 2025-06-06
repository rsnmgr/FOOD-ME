import { useState, useEffect, useContext } from 'react';
import img from '../../../assets/defaultImg.png';
import { PiMapPinAreaBold } from "react-icons/pi";
import { IoMailSharp } from "react-icons/io5";
import { MdAddIcCall } from "react-icons/md";
import { SiStartrek } from "react-icons/si";
import moment from 'moment';
import { LoginContext } from '../../ContextProvider/Context';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';  // Importing navigate
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;

export default function Profile({userRole}) {
  const { loginData } = useContext(LoginContext);
  const [userData, setUserData] = useState(null);
  const userId = userRole === "admin"
  ? loginData?.validUser?._id
  : loginData?.validUser?.AdminId;
  const id = loginData?.validUser?._id;
  const socket = io(`${API_URL}`);
  const navigate = useNavigate();  // Using useNavigate for navigation
  const user = userRole === "admin" ? 'fetch' : 'details';
  const { t } = useTranslation();

  // Fetch user data from API
  const fetchUserData = async () => {
    try {
      if (userId) {
        const res = await fetch(`${API_URL}/api/${user}/${userId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          setUserData(userRole === 'admin' ? data.customer : data.details.find(user => user._id === id));
        } else {
          console.error("Error fetching user data");
        }
      }
    } catch (error) {
      console.error("Fetch user data failed", error);
    }
  };

  useEffect(() => {
    fetchUserData(); // Initial fetch

    socket.on('userUpdated', fetchUserData); // Fetch data on user update
    socket.on('userDeleted', fetchUserData); // Fetch data on user delete

    return () => {
      socket.off('userUpdated', fetchUserData); // Cleanup on unmount
      socket.off('userDeleted', fetchUserData); // Cleanup on unmount
    };
  }, [userId,id]);

  // Handle Edit Profile button click to navigate to Settings page
  const handleEditProfile = () => {
    navigate('/admin/settings/profile');  // Use navigate to go to the Setting page
  };

  return (
    <div className="p-3 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
      {/* Left Column - User Information */}
      <div className="flex flex-col w-full md:w-1/5 space-y-6 md:space-y-4">
        {/* Profile Picture and Name */}
        <div className="flex md:flex-col space-x-2 md:space-x-0 items-center md:justify-center">
          <img
            src={userData?.image ? `${API_URL}/${userData.image}` : img}
            alt="Profile"
            className="w-16 h-16 md:w-36 md:h-36 lg:w-48 lg:h-48 rounded-full bg-gray-800 boject-cover"
          />
          <span className="font-semibold text-md md:text-xl mt-2">{userData?.name || 'Loading...'}</span>
        </div>

        {/* Edit Profile Button */}
        <button
          className="w-full p-2 bg-gray-800 rounded-sm border border-gray-600 hover:bg-gray-700 text-white text-sm"
          onClick={handleEditProfile}  // Click event to navigate
        >
          {t('edit_profile')}
        </button>

        {/* User Information */}
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-center space-x-2">
            <IoMailSharp size={18} />
            <span>{userData?.email || 'Loading...'}</span>
          </li>
          <li className="flex items-center space-x-2">
            <PiMapPinAreaBold size={18} />
            <span>{userData?.address || 'Loading...'}</span>
          </li>
          <li className="flex items-center space-x-2">
            <MdAddIcCall size={18} />
            <span>{userData?.phone || 'Loading...'}</span>
          </li>
          <li className="flex items-center space-x-2">
            <SiStartrek size={18} />
            <span>{userData?.address}</span>
          </li>
        </ul>
      </div>

      {/* Right Column (Empty for now) */}
      <div className="flex-1">
        <div className="text-center">
          <p className="text-xl font-semibold">Hello, welcome to your profile!</p>
        </div>
      </div>
    </div>
  );
}
