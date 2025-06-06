import { useState, useEffect, useContext } from 'react';
import Pending from "./kitchen/Pending";
import Preparing from "./kitchen/Preparing";
import Complete from "./kitchen/Complete";
import axios from "axios";
import { io } from "socket.io-client";
import { LoginContext } from "../../ContextProvider/Context";
import { playClickSound } from '../../ClickSound/click';
import { useTranslation } from 'react-i18next';
const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

export default function Kitchen({ userRole, userCategory }) {
  const { loginData } = useContext(LoginContext);
  const userId = userRole === "admin"
    ? loginData?.validUser?._id
    : loginData?.validUser?.AdminId;
  const { t } = useTranslation();

  const isAdmin = userRole === "admin";
  const isKitchenStaff = userRole === "staff" && userCategory === "kitchen";
  const isWaiterStaff = userRole === "staff" && userCategory === "waiter";

  const [status, setStatus] = useState("Pending");
  const [orderCounts, setOrderCounts] = useState({ pending: 0, preparing: 0, complete: 0 });

  useEffect(() => {
    if (isWaiterStaff) {
      setStatus("Complete");
    } else if (isKitchenStaff || isAdmin) {
      setStatus("Pending");
    }
  }, [isAdmin, isKitchenStaff, isWaiterStaff]);

  useEffect(() => {
    if (!userId) return;

    const fetchOrderCounts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/fetch-orders/${userId}`);
        const orders = response.data.orders || [];

        const counts = { pending: 0, preparing: 0, complete: 0 };
        orders.forEach(order => {
          order.OrderHistory.forEach(history => {
            if (history.itemsStatus === "pending") counts.pending++;
            else if (history.itemsStatus === "accepted") counts.preparing++;
            else if (history.itemsStatus === "ready") counts.complete++;
          });
        });

        setOrderCounts(counts);
      } catch (error) {
        console.error("Error fetching order counts:", error);
      }
    };

    fetchOrderCounts();

    socket.on("orderAdded", fetchOrderCounts);
    socket.on("orderUpdated", fetchOrderCounts);
    socket.on("orderRemoved", fetchOrderCounts);
    socket.on("orderHistoryRemoved", fetchOrderCounts);

    return () => {
      socket.off("orderAdded", fetchOrderCounts);
      socket.off("orderUpdated", fetchOrderCounts);
      socket.off("orderRemoved", fetchOrderCounts);
      socket.off("orderHistoryRemoved", fetchOrderCounts);
    };
  }, [userId]);

  return (
    <div className='flex flex-col h-full px-3'>
      <div className='flex md:justify-between items-center border-b border-gray-600 py-2'>
        <h1 className='hidden md:block text-lg font-bold'>{t('currentOrderDetails')}</h1>
        <div className='flex justify-between items-center space-x-3'>

          {(isAdmin || isKitchenStaff) && (
            <button
              onClick={() => { setStatus("Pending"); playClickSound(); }}
              className={`p-1 px-4 rounded-lg transition-all duration-200 
                ${status === "Pending" 
                  ? "bg-yellow-700 text-white shadow-md font-semibold ring-2 ring-yellow-300"
                  : "bg-yellow-400 text-black hover:bg-yellow-500"}`}
            >
              {t('pending')} ({orderCounts.pending})
            </button>
          )}

          {(isAdmin || isKitchenStaff) && (
            <button
              onClick={() => { setStatus("Preparing"); playClickSound(); }}
              className={`p-1 px-4 rounded-lg transition-all duration-200 
                ${status === "Preparing" 
                  ? "bg-blue-700 text-white shadow-md font-semibold ring-2 ring-blue-300"
                  : "bg-blue-400 text-black hover:bg-blue-500"}`}
            >
              {t('preparing')} ({orderCounts.preparing})
            </button>
          )}

          {(isAdmin || isWaiterStaff) && (
            <button
              onClick={() => { setStatus("Complete"); playClickSound(); }}
              className={`p-1 px-4 rounded-lg transition-all duration-200 
                ${status === "Complete" 
                  ? "bg-green-700 text-white shadow-md font-semibold ring-2 ring-green-300"
                  : "bg-green-400 text-black hover:bg-green-500"}`}
            >
             {t('complete')} ({orderCounts.complete})
            </button>
          )}
        </div>
      </div>

      <div className='flex-1 overflow-y-auto mt-3'>
        {status === "Pending" && <Pending userRole={userRole} playClickSound={playClickSound} />}
        {status === "Preparing" && <Preparing userRole={userRole} playClickSound={playClickSound} />}
        {status === "Complete" && <Complete userRole={userRole} playClickSound={playClickSound} />}
      </div>
    </div>
  );
}
