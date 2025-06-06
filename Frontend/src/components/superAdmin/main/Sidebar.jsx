/* React Icons */
import { RxDashboard } from "react-icons/rx";
import { GrUserAdmin } from "react-icons/gr";
import { FaUsers } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";

export default function Sidebar({setSidebar,handlePageChange, currentPage}) {
    const handleItemClick = (page) => {
        handlePageChange(page);  // Update the current page
        setSidebar(false);        // Close the sidebar on small screens
    };
  return (
    <div>
      <div className='flex justify-between md:justify-start p-3 shadow-md'>
        <h1>Food Me</h1>
        <RxCross2 size={20} onClick={()=>setSidebar(false)} className='md:hidden cursor-pointer'/>
      </div>
      <ul>
        <li className={`flex items-center p-3 space-x-3 cursor-pointer ${currentPage === 'Dashboard' ? 'bg-gray-800' : 'bg-gray-900'}`} onClick={() => handleItemClick('Dashboard')}><RxDashboard size={18}/><span>Dashboard</span></li>
        <li className={`flex items-center p-3 space-x-3 cursor-pointer ${currentPage === 'My Admin' ? 'bg-gray-800' : 'bg-gray-900'}`} onClick={() => handleItemClick('My Admin')}><GrUserAdmin size={18}/><span>My Admin</span></li>
        <li className={`flex items-center p-3 space-x-3 cursor-pointer ${currentPage === 'Users Info' ? 'bg-gray-800' : 'bg-gray-900'}`} onClick={() => handleItemClick('Users Info')}><FaUsers size={18}/><span>Users Info</span></li>
        <li className={`flex items-center p-3 space-x-3 cursor-pointer ${currentPage === 'Settings' ? 'bg-gray-800' : 'bg-gray-900'}`} onClick={() => handleItemClick('Settings')}><IoMdSettings size={18}/><span>Settings</span></li>
      </ul>
    </div>
  )
}
