import { useState, useEffect, useContext } from 'react';
import img from '../../../assets/defaultImg.png';
import Sidebar from './Setting/Sidebar';
import Profile from './Setting/pages/Profile';
import Account from './Setting/pages/Account';
import Notification from './Setting/pages/Notification';
import Security from './Setting/pages/Security';
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../../ContextProvider/Context';
import io from 'socket.io-client';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;

export default function Setting({ userRole }) {
  const { t } = useTranslation();
  const { loginData } = useContext(LoginContext);
  const [userData, setUserData] = useState(null);
  const [activePage, setActivePage] = useState('Profile');
  const userId = userRole === 'admin'
    ? loginData?.validUser?._id
    : loginData?.validUser?.AdminId;
  const user = userRole === 'admin' ? 'fetch' : 'details';
  const id = loginData?.validUser?._id;

  const navigate = useNavigate();
  const socket = useState(() => io(API_URL))[0];

  useEffect(() => {
    if (userId && id) fetchUserData();
    socket.on('userUpdated', fetchUserData);
    socket.on('userDeleted', fetchUserData);
    return () => {
      socket.off('userUpdated', fetchUserData);
      socket.off('userDeleted', fetchUserData);
    };
  }, [userId, socket, id]);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/${user}/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUserData(userRole === 'admin' ? data.customer : data.details.find(user => user._id === id));
      }
    } catch (error) {
      console.error(t('error_fetching_user_data'), error);
    }
  };

  const renderActivePage = () => {
    const pages = {
      Profile: <Profile userRole={userRole} />,
      Account: <Account />,
      Notification: <Notification />,
      Security: <Security userRole={userRole} />,
    };
    return pages[activePage] || <Profile userRole={userRole} />;
  };

  // Optional: Change document title based on language and active page
  useEffect(() => {
    document.title = t(activePage.toLowerCase());
  }, [activePage, t]);

  return (
    <div className="p-3 space-y-4 max-w-screen-lg">
      <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4">
        <div className="flex items-center space-x-4">
          <img
            src={userData?.image ? `${API_URL}/${userData.image}` : img}
            alt={t('profile_picture')}
            className="w-12 h-12 object-cover rounded-full border cursor-pointer"
          />
          <div>
            <span className="text-lg font-medium">{userData?.name || t('loading')}</span>
            <span className="block text-sm text-gray-400">{t('your_personal_account')}</span>
          </div>
        </div>
        <button
          className="p-1 bg-gray-900 px-3 rounded-md text-sm border border-gray-700"
          onClick={() => {
            navigate('/admin/profile');
            setActivePage('Profile');
          }}
        >
          {t('go_to_personal_profile')}
        </button>
      </div>
      <div className="flex flex-col md:flex-row md:space-x-4">
        <div className="w-full md:w-1/5 mb-4 md:mb-0">
          <Sidebar activePage={activePage} setActivePage={setActivePage} userRole={userRole} />
        </div>
        <div className="w-full md:w-4/5">{renderActivePage()}</div>
      </div>
    </div>
  );
}
