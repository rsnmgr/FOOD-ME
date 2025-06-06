import { useState, useContext, useEffect, useRef } from 'react';
import { GiRoundTable } from "react-icons/gi";
import { MdOutlineMenu } from "react-icons/md";
import { IoIosNotifications } from "react-icons/io";
import Side from './Side';
import Notification from './Notification';
import SoundPlayer from '../Notification/SoundPlayer';
import { playClickSound } from '../ClickSound/click';
import { useTranslation } from 'react-i18next';

import { CustomerContext } from '../ContextProvider/CustomerContext';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Header() {
  const { CustomerId, tableData, AdminId, tableId } = useContext(CustomerContext);
  const [sidebar, setSidebar] = useState(false);
  const [notification, setNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const soundRef = useRef();
  const { t} = useTranslation('customer');

  const notificationData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/fetch-orders/${AdminId}/${tableId}/${CustomerId}`);
      const data = await response.json();

      if (data.orders && data.orders.OrderHistory && data.orders.OrderHistory.length > 0) {
        const newNotifications = data.orders.OrderHistory.map((history, index) => {
          let notificationMessage = '';
          const title = `#${index + 1}`; // Replaces {{title}}

          if (history.itemsStatus === 'accepted') {
            notificationMessage = t('home.orderAccepted', { title });
          } else if (history.itemsStatus === 'ready') {
            notificationMessage = t('home.orderReady', { title });
          } else if (history.itemsStatus === 'pending') {
            notificationMessage = t('home.orderPending', { title });
          } else if (history.itemsStatus === 'Finished') {
            notificationMessage = t('home.orderFinished', { title });
          }

          return {
            title,
            date: history.orderDate,
            status: history.itemsStatus,
            orderId: history._id,
          };
        });

        setNotifications((prev) => {
          let hasStatusChanged = false;
          const updatedNotifications = prev.map((existing) => {
            const updated = newNotifications.find((n) => n.orderId === existing.orderId);
            if (updated) {
              if (existing.status !== updated.status) {
                hasStatusChanged = true;
                return updated;
              }
              return existing;
            }
            return existing;
          });

          // Add new notifications only if not already present
          newNotifications.forEach((n) => {
            const exists = prev.find((p) => p.orderId === n.orderId);
            if (!exists) {
              hasStatusChanged = true;
              updatedNotifications.push(n);
            }
          });

          // Play sound if there is a status change
          if (hasStatusChanged && soundRef.current) {
            soundRef.current.playSound();
          }

          return updatedNotifications;
        });
      } else {
        // Clear notifications if there are no orders
        setNotifications([]);
        // Clear clicked notifications from localStorage
        localStorage.removeItem('clickedNotifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // In case of error, clear notifications
      setNotifications([]);
    }
  };

  useEffect(() => {
  if (!AdminId || !tableId || !CustomerId) return;

  notificationData();

  const handleNotification = () => {
    notificationData();
  };

  socket.on("orderUpdated", handleNotification);
  socket.on("reportAdded", handleNotification);
  socket.on("orderRemoved", handleNotification);
  socket.on("orderHistoryRemoved", handleNotification);

  return () => {
    socket.off("orderUpdated", handleNotification);
    socket.off("reportAdded", handleNotification);
    socket.off("orderRemoved", handleNotification);
    socket.off("orderHistoryRemoved", handleNotification);
  };
}, [AdminId, tableId, CustomerId]);


  // Filter notifications to exclude already clicked ones
  const unreadNotifications = notifications.filter((notification) => {
    const clickedNotifications = JSON.parse(localStorage.getItem('clickedNotifications')) || [];
    return !clickedNotifications.includes(notification.orderId);
  });

  return (
    <div className="relative flex justify-between items-center p-2">
      <div>
        <h1 className="text-md font-bold">FOOD ME</h1>
      </div>

      <div className="flex items-center space-x-2">
        <GiRoundTable size={24} />
        <span className="text-sm font-medium">
          {tableData ? tableData.table.name : 'Loading...'}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <div
          className="relative cursor-pointer"
          onClick={() => {
            setNotification(!notification);
            playClickSound();
          }}
        >
          <label className="absolute -top-1 -right-1 text-xs text-white bg-red-900 rounded-full h-5 w-5 flex items-center justify-center cursor-pointer">
            {unreadNotifications.length}
          </label>
          <IoIosNotifications size={24} />
        </div>

        <div
          className="cursor-pointer"
          onClick={() => {
            setSidebar(true);
            playClickSound();
          }}
        >
          <MdOutlineMenu size={24} />
        </div>
      </div>

      {sidebar && (
        <div className="absolute bg-gray-900 right-0 top-0 w-1/2 md:w-1/5 h-screen z-50 rounded-l-2xl border-l border-gray-700">
          <Side setSidebar={setSidebar} playClickSound={playClickSound} />
        </div>
      )}

      {notification && (
        <div className="absolute  right-0 right-10 top-12 md:w-1/2 lg:w-1/4 bg-gray-900 border border-gray-600 rounded-2xl z-50 flex flex-col">
          <Notification notifications={notifications} setNotification={setNotification} />
        </div>
      )}

      {/* ✅ SoundPlayer for audio notification */}
      <SoundPlayer ref={soundRef} />
    </div>
  );
}