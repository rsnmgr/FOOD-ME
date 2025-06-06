import { useState, useEffect, useContext, useRef } from 'react';
import { GiHamburgerMenu } from "react-icons/gi";
import { IoNotifications } from "react-icons/io5";
import { LoginContext } from '../../ContextProvider/Context';
import DropDown from './DropDown';
import Notification from './Notification';
import SoundPlayer from '../../Notification/sound';
import io from 'socket.io-client';
import { MdOutlineLanguage } from "react-icons/md";
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;

export default function Header({ toggleSidebar, profile, setProfile, title, setSidebar, userRole }) {
  const { loginData } = useContext(LoginContext);
  const [userData, setUserData] = useState(null);
  const [notification, setNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [tables, setTables] = useState({});
  const [unseenNotificationCount, setUnseenNotificationCount] = useState(0);
  const userId = userRole === 'admin' ? loginData?.validUser?._id : loginData?.validUser?.AdminId;
  const id = loginData?.validUser?._id;
  const user = userRole === "admin" ? 'fetch' : 'details';
  const soundRef = useRef();
  const socketRef = useRef(null);

  // Language state and handler
  const [language, setLanguage] = useState(false);
  const { i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(localStorage.getItem('i18nextLng') || 'en');
  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
    setSelectedLang(lang);
    setLanguage(false); // close dropdown after selection
  };

  // Toggle notification panel
  const notificationToggle = () => {
    setNotification(!notification);
    setProfile(false);
  };

  // Toggle profile panel
  const handleProfileClick = () => {
    setProfile(!profile);
    setNotification(false);
  };

  // Fetch user data from API
  const fetchUserData = async () => {
    try {
      if (userId) {
        const res = await fetch(`${API_URL}/api/${user}/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setUserData(userRole === 'admin' ? data.customer : data.details.find(user => user._id === id));
        }
      }
    } catch (error) {
      console.error("Fetch user data failed", error);
    }
  };

  // Fetch tables and map them by ID
  const fetchTables = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tables/${userId}`);
      const data = await res.json();
      if (Array.isArray(data?.tables)) {
        const tableMap = data.tables.reduce((acc, table) => {
          acc[table._id] = table.name;
          return acc;
        }, {});
        setTables(tableMap);
      }
    } catch (err) {
      console.error("Error fetching tables", err);
    }
  };

  // Fetch orders and prepare notifications
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${userId}`);
      const data = await res.json();
      if (Array.isArray(data?.orders)) {
        let formattedNotifications = [];
        data.orders.forEach((order) => {
          if (order.OrderHistory && order.OrderHistory.length > 0) {
            const tableId = order.tableId;
            const tableName = tables[tableId] || "Unknown Table";
            
            const sortedHistory = order.OrderHistory
              .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

            sortedHistory.forEach((history, index) => {
              formattedNotifications.push({
                tableId,
                tableName,
                messageKey: index === 0 ? 'newOrderPlaced' : 'addedOrderPlaced',
                messageParams: { title: tableName },
                timestamp: history.orderDate,
                type: index === 0 ? "newOrder" : "addedOrder",
                orderHistoryId: history._id,
                seen: history.notification,
                status: history.itemsStatus
              });
            });
          }
        });

        // Sort by date, most recent first
        formattedNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setNotifications(formattedNotifications);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Error fetching orders", err);
      setNotifications([]);
    }
  };

  // Fetch count of unseen notifications
  const notificationCount = async () => {
    try {
      const res = await fetch(`${API_URL}/api/countUnseenNotifications/${userId}`);
      const data = await res.json();
      setUnseenNotificationCount(data.unseenCount);
    } catch (error) {
      console.error("Error fetching unseen notification count", error);
    }
  };

  // Mark notification as seen on backend
  const markNotificationSeen = async (tableId, orderHistoryId) => {
    try {
      await fetch(`${API_URL}/api/markNotificationSeen/${userId}/${tableId}/${orderHistoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      notificationCount(); // Refresh unseen count
    } catch (err) {
      console.error("Error marking notification as seen", err);
    }
  };

  // Fetch user data and tables on userId change
  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchTables();
    }
  }, [userId, id]);

  // Fetch orders when tables or userId update
  useEffect(() => {
    if (Object.keys(tables).length > 0 && userId) {
      fetchOrders();
    }
  }, [tables, userId]);

  // Setup socket.io and event listeners
  useEffect(() => {
    if (userId) {
      socketRef.current = io(API_URL);

      const handleOrderAdded = async (orderData) => {
        try {
          // Fetch fresh data immediately when new order is added
          const res = await fetch(`${API_URL}/api/orders/${userId}`);
          const data = await res.json();
          
          if (Array.isArray(data?.orders)) {
            let formattedNotifications = [];
            data.orders.forEach((order) => {
              if (order.OrderHistory && order.OrderHistory.length > 0) {
                const tableId = order.tableId;
                const tableName = tables[tableId] || "Unknown Table";
                
                const sortedHistory = order.OrderHistory
                  .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

                sortedHistory.forEach((history, index) => {
                  formattedNotifications.push({
                    tableId,
                    tableName,
                    messageKey: index === 0 ? 'newOrderPlaced' : 'addedOrderPlaced',
                    messageParams: { title: tableName },
                    timestamp: history.orderDate,
                    type: index === 0 ? "newOrder" : "addedOrder",
                    orderHistoryId: history._id,
                    seen: history.notification,
                    status: history.itemsStatus
                  });
                });
              }
            });

            formattedNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setNotifications(formattedNotifications);
          }

          // Play sound for new order
          soundRef.current?.playSound();
          // Update notification count
          notificationCount();
        } catch (error) {
          console.error("Error handling new order:", error);
        }
      };

      const handleOrderUpdate = async () => {
        await fetchOrders();
        await notificationCount();
      };

      // Initialize
      fetchOrders();
      notificationCount();

      // Socket event listeners
      socketRef.current.on("orderAdded", handleOrderAdded);
      socketRef.current.on("orderUpdated", handleOrderUpdate);
      socketRef.current.on("orderRemoved", handleOrderUpdate);
      socketRef.current.on("orderHistoryRemoved", handleOrderUpdate);
      socketRef.current.on("orderItemRemoved", handleOrderUpdate);
      socketRef.current.on("notificationSeen", handleOrderUpdate);
      socketRef.current.on("userUpdated", fetchUserData);
      socketRef.current.on("userDeleted", fetchUserData);

      return () => {
        if (socketRef.current) {
          socketRef.current.off("orderAdded", handleOrderAdded);
          socketRef.current.off("orderUpdated", handleOrderUpdate);
          socketRef.current.off("orderRemoved", handleOrderUpdate);
          socketRef.current.off("orderHistoryRemoved", handleOrderUpdate);
          socketRef.current.off("orderItemRemoved", handleOrderUpdate);
          socketRef.current.off("notificationSeen", handleOrderUpdate);
          socketRef.current.off("userUpdated", fetchUserData);
          socketRef.current.off("userDeleted", fetchUserData);
          socketRef.current.disconnect();
        }
      };
    }
  }, [tables, userId]);

  return (
    <div>
      <div className='flex justify-between items-center'>
        <div className='flex items-center space-x-3'>
          <GiHamburgerMenu size={20} onClick={toggleSidebar} className='cursor-pointer' />
          <h1>{title}</h1>
        </div>
        <div className='flex items-center space-x-4'>
          <div className="relative cursor-pointer" onClick={notificationToggle}>
            {unseenNotificationCount > 0 && (
              <label className="absolute -top-1 -right-1 text-xs text-white bg-red-700 rounded-full h-4 w-4 flex items-center justify-center cursor-pointer">
                {unseenNotificationCount}
              </label>
            )}
            <IoNotifications size={24} />
          </div>

          {/* Language */}
          <div className='cursor-pointer' onClick={() => setLanguage(!language)}>
            <MdOutlineLanguage size={24} />
          </div>

          <div onClick={handleProfileClick} className='cursor-pointer'>
            {userData?.image ? (
              <img
                src={`${API_URL}/${userData.image}`}
                alt=""
                className='w-6 h-6 rounded-full border border-gray-400 object-cover'
              />
            ) : (
              <h1 className="w-8 h-8 flex justify-center items-center rounded-full object-cover text-white font-bold border border-gray-400">
                {userData?.name?.[0]?.toUpperCase()}
              </h1>
            )}
          </div>
        </div>
      </div>

      <SoundPlayer ref={soundRef} />

      {profile && (
        <div className='absolute right-0 top-0 bg-gray-900 h-screen border-l border-gray-600 rounded-l-2xl p-4 z-50'>
          <DropDown profileClick={handleProfileClick} setSidebar={setSidebar} userData={userData} />
        </div>
      )}

      {notification && (
        <div className='absolute right-0 md:right-10 top-12 md:w-1/2 lg:w-1/4 bg-gray-900 md:h-[66%] border border-gray-600 rounded-2xl z-50 flex flex-col'>
          <Notification setNotification={setNotification} notifications={notifications} markNotificationSeen={markNotificationSeen} />
        </div>
      )}

      {language && (
        <div className='absolute bg-gray-800 right-10 w-1/2 md:w-1/3 lg:w-1/4 top-12 border border-gray-500 rounded-2xl z-50'>
          <ul>
            <li
              className={`px-4 py-2 hover:bg-gray-700 rounded-t-2xl cursor-pointer ${selectedLang === 'en' ? 'bg-gray-700 font-bold' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              English
            </li>
            <li
              className={`px-4 py-2 hover:bg-gray-700 cursor-pointer ${selectedLang === 'np' ? 'bg-gray-700 font-bold' : ''}`}
              onClick={() => handleLanguageChange('np')}
            >
              नेपाली
            </li>
            <li
              className={`px-4 py-2 hover:bg-gray-700 rounded-b-2xl cursor-pointer ${selectedLang === 'ja' ? 'bg-gray-700 font-bold' : ''}`}
              onClick={() => handleLanguageChange('ja')}
            >
              日本語
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
