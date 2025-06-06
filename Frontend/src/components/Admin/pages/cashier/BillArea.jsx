import {useContext, useState,useEffect} from 'react'
import { LoginContext } from '../../../ContextProvider/Context';
import io from 'socket.io-client';
// Page
import Dinein from './billarea/Dinein';
import TakeAway from './billarea/TableBooking';
import Delivery from './billarea/Delivary';
import TableBooking from './billarea/TableBooking';
import {playClickSound} from '../../../ClickSound/click';
import { useTranslation } from 'react-i18next';

export default function BillArea({setSelectedTable,userRole}) {
  const API_URL = import.meta.env.VITE_API_URL;
  const socket = io(API_URL);
  const { loginData } = useContext(LoginContext);
  const userId = userRole === "admin"
  ? loginData?.validUser?._id
  : loginData?.validUser?.AdminId;
  const [userData,setUserData] = useState();
  const [selectedTab, setSelectedTab] = useState('dinein');
  const { t } = useTranslation();

  const renderSelectedPage = () => {
    switch (selectedTab) {
      case 'dinein':
      return <Dinein setSelectedTable={setSelectedTable} userRole={userRole} playClickSound={playClickSound} userData={userData}/>;
      case 'takeaway':
        return <TakeAway />;
      case 'delivery':
        return <Delivery />;
      case 'tablebooking':
        return <TableBooking />;
      default:
        return <Dinein />;
    }
  };

  const fetchUserData = async ()=>{
    try {
      const res = await fetch(`${API_URL}/api/fetch/${userId}`);
      if(res.ok){
        const data = await res.json();
        setUserData(data);
      }
    } catch (error) {
      console.log("Error fetching user data",error)
    }
  }
  useEffect(() => {
      if (userId) fetchUserData();
      socket.on('userUpdated', fetchUserData);
      return () => socket.off('userUpdated', fetchUserData);
    }, [userId]);
  return (
    <div className="flex flex-col h-full p-1 border border-gray-800">
        <div className='grid grid-cols-4  border-b border-gray-800'>
          <button className={`border border-gray-800 p-2 ${selectedTab === 'dinein' ? "bg-gray-900":""}`}onClick={() => {playClickSound();setSelectedTab('dinein')}}>{t('dineIn')}</button>
          <button className={`border border-gray-800 p-2  cursor-not-allowed ${selectedTab === 'takeaway' ? "bg-gray-800":""}`}onClick={() => {playClickSound();setSelectedTab('takeaway')}} disabled title='Comming Soon'>{t('takeAway')}</button>
          <button className={`border border-gray-800 p-2 cursor-not-allowed${selectedTab === 'delivery' ? "bg-gray-800":""}`}onClick={() => {playClickSound();setSelectedTab('delivery')}} disabled title='Comming Soon'>{t('delivery')}</button>
          <button className={`border border-gray-800 p-2 cursor-not-allowed ${selectedTab === 'tablebooking' ? "bg-gray-800":""}`}onClick={() => {playClickSound();setSelectedTab('tablebooking')}} disabled title='Comming Soon'>{t('tableBooking')}</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {renderSelectedPage()}
        </div>
    </div>
  )
}
