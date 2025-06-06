import { useState } from 'react';
import img from '../../../assets/defaultImg.png';
import Sidebar from './Setting/Sidebar';
import Profile from './Setting/pages/Profile';
import Account from './Setting/pages/Account';
import Notification from './Setting/pages/Notification';

export default function Setting({ handlePageChange }) {
  const [activePage, setActivePage] = useState('Profile'); // State to track the active page

  const renderActivePage = () => {
    switch (activePage) {
      case 'Profile':
        return <Profile />;
      case 'Account':
        return <Account />;
      case 'Notification':
        return <Notification />;
      default:
        return <Profile />;
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0'>
        <div className='flex items-center space-x-4'>
          <img
            src={img}
            alt=""
            className='w-12 h-12 object-cover rounded-full border cursor-pointer'
          />
          <div>
            <span className='text-lg font-medium'>Roshan Thapa Magar</span>
            <span className='block text-sm text-gray-400'>Your personal account</span>
          </div>
        </div>
        <button
          className='p-1 bg-gray-900 px-3 rounded-md text-sm border border-gray-700 w-full md:w-auto text-center'
          onClick={() => handlePageChange('Profile')}
        >
          Go to your personal profile
        </button>
      </div>
      <div className='flex flex-col md:flex-row space-x-4 '>
        <div className='w-full md:w-1/5 mb-4 md:mb-0'>
          <Sidebar activePage={activePage} setActivePage={setActivePage} />
        </div>
        <div className='w-full md:w-4/5'>{renderActivePage()}</div>
      </div>
    </div>
  );
}
