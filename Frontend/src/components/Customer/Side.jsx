import { useContext, useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { CustomerContext } from '../ContextProvider/CustomerContext';
const API_URL = import.meta.env.VITE_API_URL;
import { useTranslation } from 'react-i18next';

export default function Side({ setSidebar,playClickSound }) {
  const { customerData, CustomerId, AdminId, tableId } = useContext(CustomerContext);
  const navigate = useNavigate();
  const [showMessage, setShowMessage] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const { t} = useTranslation('customer');

  const handleBillClick = () => {
    navigate('/menu/bill');
    setSidebar(false);
    playClickSound();
  };

  const handleHistryClick = () => {
    navigate('/menu/histry');
    setSidebar(false);
    playClickSound();
  };
  const myprofile =()=>{
    navigate('/menu/myProfile');
    setSidebar(false);
    playClickSound();
  }

  const logOutUser = async () => {
    let token = localStorage.getItem("customerToken");
    try {
      const response = await fetch(`${API_URL}/api/fetch-orders/${AdminId}/${tableId}/${CustomerId}`);
      const data = await response.json();

      if (response.ok) {
        setShowMessage(true); // Show the custom message
      } else {
        setShowLogoutConfirmation(true); // Show logout confirmation modal
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const confirmLogout = () => {
    localStorage.removeItem("customerToken");
    navigate('/');
  };

  const cancelLogout = () => {
    setShowLogoutConfirmation(false); // Close confirmation modal
  };
  

  return (
    <div className="bg-gray-900 text-white rounded-lg relative min-h-screen">
      <div className='p-[5.5px] flex justify-between items-center border-b border-gray-700'> 
        <div className="bg-gray-700 p-2 rounded-full hover:bg-gray-800 cursor-pointer transition duration-300" onClick={() => setSidebar(false)}>
          <FaArrowRight />
        </div>
        <div>
          <h1></h1>
        </div>
      </div>
      <ul>
      <li className="w-full flex justify-center p-2 border-b border-gray-800  cursor-pointer hover:text-gray-300 hover:bg-gray-800" onClick={myprofile}>{t('home.myProfile')}</li>
        <li className="w-full flex justify-center p-2 border-b border-gray-800  cursor-pointer hover:text-gray-300 hover:bg-gray-800" onClick={handleBillClick}>{t('home.currentOrders')}</li>
        <li className="w-full flex justify-center p-2 border-b border-gray-800  cursor-pointer hover:text-gray-300 hover:bg-gray-800" onClick={handleHistryClick}>{t('home.orderedHistory')}</li>
        <li className="w-full flex justify-center p-2 border-b border-gray-800  cursor-pointer hover:text-gray-300 hover:bg-gray-800" onClick={()=>{logOutUser();playClickSound()}}>{t('home.logout')}</li>
      </ul>

      {/* Sorry Message */}
      {showMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 p-4 z-50">
          <div className="bg-gray-800  p-6 rounded-lg shadow-xl text-center max-w-md">
            <h2 className="text-lg font-semibold mb-4">{t('home.sorry')}</h2>
            <p>{t('home.tableAlreadyOrdered')}</p>
            <button 
              className="mt-4 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
              onClick={() => {setShowMessage(false);playClickSound();}}
            >
              {t('home.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation */}
      {showLogoutConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
          <div className="bg-gray-800  p-6 rounded-lg shadow-xl text-center max-w-md">
            <h2 className="text-lg font-semibold mb-4">{t('home.confirmLogout')}</h2>
            <div className="flex justify-center space-x-4">
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={confirmLogout}
              >
                {t('home.yesLogout')}
              </button>
              <button 
                className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
                onClick={()=>{cancelLogout();playClickSound();}}
              >
                {t('home.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
