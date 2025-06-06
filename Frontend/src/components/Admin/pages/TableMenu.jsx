import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { LoginContext } from '../../ContextProvider/Context';
import io from 'socket.io-client';
import { playClickSound } from '../../ClickSound/click';
import { useNavigate } from 'react-router-dom';
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { useTranslation } from 'react-i18next';
const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

export default function TableMenu({ userRole }) {
  const { loginData } = useContext(LoginContext);
  const AdminId = userRole === "admin"
    ? loginData?.validUser?._id
    : loginData?.validUser?.AdminId;
  const { t } = useTranslation();

  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const fetchTables = async () => {
    try {
      const tableResponse = await axios.get(`${API_URL}/api/tables/${AdminId}`);
      if (Array.isArray(tableResponse.data?.tables)) {
        setTables(tableResponse.data.tables);
      } else {
        console.error('Unexpected tables format:', tableResponse.data);
        setTables([]);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      setTables([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const orderResponse = await axios.get(`${API_URL}/api/orders/${AdminId}`);
      if (Array.isArray(orderResponse.data?.orders)) {
        setOrders(orderResponse.data.orders);
      } else {
        console.error('Unexpected orders format:', orderResponse.data);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  useEffect(() => {
    if (!AdminId) return;

    fetchTables();
    fetchOrders();

    const handleOrderAdded = (orderData) => {
      setOrders((prevOrders) => {
        if (Array.isArray(orderData)) {
          return [...prevOrders, ...orderData];
        } else {
          const existingOrderIndex = prevOrders.findIndex(
            (order) => order.tableId === orderData.tableId
          );
          if (existingOrderIndex === -1) {
            return [...prevOrders, orderData];
          } else {
            const updatedOrders = [...prevOrders];
            updatedOrders[existingOrderIndex] = orderData;
            return updatedOrders;
          }
        }
      });
    };

    const handleOrderRemoved = (orderData) => {
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.tableId !== orderData.tableId)
      );
    };

    const handleOrderItemRemoved = async () => {
      await fetchOrders();
    };

    const handleOrderHistoryRemoved = (removedData) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order?.tableId === removedData.tableId) {
            const updatedHistory = order.OrderHistory?.filter(
              (history) => history._id !== removedData.orderId
            ) ?? [];
            const newTotalAmount = updatedHistory.reduce(
              (acc, history) => acc + (history.total || 0),
              0
            );
            return { ...order, OrderHistory: updatedHistory, totalOrderAmount: newTotalAmount };
          }
          return order;
        })
      );
    };

    socket.on('orderAdded', handleOrderAdded);
    socket.on('orderRemoved', handleOrderRemoved);
    socket.on('orderItemRemoved', handleOrderItemRemoved);
    socket.on('orderHistoryRemoved', handleOrderHistoryRemoved);

    return () => {
      socket.off('orderAdded', handleOrderAdded);
      socket.off('orderRemoved', handleOrderRemoved);
      socket.off('orderItemRemoved', handleOrderItemRemoved);
      socket.off('orderHistoryRemoved', handleOrderHistoryRemoved);
    };
  }, [AdminId]);

  const getTableDetails = (tableId) => {
    const tableOrder = orders.find((order) => order.tableId === tableId);
    const table = tables.find((table) => table._id === tableId);

    if (!table) return { statusClass: 'bg-gray-900', tableName: 'Unknown', isRunning: false };

    let statusClass = 'bg-gray-900';
    let totalOrderAmount = null;
    let tableName = table.name || 'Unknown';
    let isRunning = false;

    if (tableOrder) {
      totalOrderAmount = tableOrder.totalOrderAmount;
      if (tableOrder.orderStatus === 'Running') {
        statusClass = 'bg-red-900';
        isRunning = true;
      }
    }

    return { statusClass, totalOrderAmount, tableName, isRunning };
  };

  const handleTableClick = (tableId) => {
    playClickSound();
    localStorage.setItem('TableId', tableId);
    navigate('/admin/table-menu/main');
  };

  const handleTableBillboard = (tableId) => {
    playClickSound();
    localStorage.setItem('selectedTableId', tableId);
    navigate('/admin/cashier');
  };

  return (
    <div className="flex flex-col h-full p-3">
      <div className="flex justify-between items-center mb-4">
        <h1>{t('currentTables')}</h1>
        <ul className="flex items-center">
          <li className="bg-gray-800 p-1.5 rounded-full mr-2"></li>
          <li className="mr-4">{t('blank')}</li>
          <li className="bg-red-800 p-1.5 rounded-full mr-2"></li>
          <li>{t('running')}</li>
        </ul>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 2xl:grid-cols-8 gap-4">
          {tables.length > 0 ? (
            tables.map((table) => {
              const { statusClass, totalOrderAmount, tableName, isRunning } = getTableDetails(table._id);
              return (
                <div
                  key={table._id}
                  className={`border-dotted border-2 border-gray-800 ${statusClass} flex justify-center items-center cursor-pointer rounded-md`}
                  onClick={() => handleTableClick(table._id)}
                >
                  <div className="relative w-16 h-16 flex flex-col justify-center items-center">
                    <h1 className="text-xs">{tableName}</h1>
                    {totalOrderAmount !== null && totalOrderAmount !== 0 && (
                      <h1 className="text-xs">{totalOrderAmount}</h1>
                    )}
                    {isRunning && (
                      <MdOutlineRemoveRedEye
                        size={20}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTableBillboard(table._id);
                        }}
                        title='View Bill'
                        className="absolute -bottom-2 border border-gray-400 rounded-sm bg-gray-800 text-gray-400 hover:text-white cursor-pointer"
                      />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">No tables available</p>
          )}
        </div>
      </div>
    </div>
  );
}
