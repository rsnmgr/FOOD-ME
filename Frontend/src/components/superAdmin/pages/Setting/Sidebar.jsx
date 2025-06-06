import { LiaUserSolid } from 'react-icons/lia';
import { IoMdSettings } from 'react-icons/io';
import { IoNotifications } from 'react-icons/io5';

export default function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { name: 'Profile', icon: <LiaUserSolid className='text-gray-500' size={20} />, label: 'Public Profile' },
    { name: 'Account', icon: <IoMdSettings className='text-gray-500' size={20} />, label: 'Account' },
    { name: 'Notification', icon: <IoNotifications className='text-gray-500' size={20} />, label: 'Notifications' },
  ];

  return (
    <div>
      <ul className='space-y-1'>
        {menuItems.map((item) => (
          <li
            key={item.name}
            className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer ${
              activePage === item.name ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-gray-400'
            }`}
            onClick={() => setActivePage(item.name)}
          >
            {item.icon}
            <span className='text-sm'>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
