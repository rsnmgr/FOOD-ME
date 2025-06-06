import { useState, useEffect, useContext } from 'react';
import { LoginContext } from '../../../ContextProvider/Context';
import axios from 'axios';
import { io } from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoMdStar } from "react-icons/io";
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

export default function Preparing({ userRole, playClickSound }) {
  const [orders, setOrders] = useState([]);
  const [tableData, setTableData] = useState({});
  const [modal, setModal] = useState({ open: false, type: null, orderHistoryId: null, tableId: null });
  const [instructionModal, setInstructionModal] = useState({ open: false, content: "" });

  const { loginData } = useContext(LoginContext);
  const userId = userRole === "admin"
    ? loginData?.validUser?._id
    : loginData?.validUser?.AdminId;
  const { t } = useTranslation();

  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/fetch-orders/${userId}`);
        const filteredOrders = response.data.orders?.filter(order =>
          order.OrderHistory.some(history => history.itemsStatus === "accepted")
        ) || [];
        setOrders(filteredOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();

    socket.on("orderAdded", fetchOrders);
    socket.on("orderUpdated", fetchOrders);
    socket.on("orderRemoved", fetchOrders);
    socket.on("orderHistoryRemoved", fetchOrders);
    socket.on("orderItemRemoved", fetchOrders);

    return () => {
      socket.off("orderAdded", fetchOrders);
      socket.off("orderUpdated", fetchOrders);
      socket.off("orderRemoved", fetchOrders);
      socket.off("orderHistoryRemoved", fetchOrders);
      socket.off("orderItemRemoved", fetchOrders);
    };
  }, [userId]);

  useEffect(() => {
    const fetchTableData = async (tableId) => {
      if (tableData[tableId] || !userId) return;
      try {
        const response = await axios.get(`${API_URL}/api/tables/${userId}/${tableId}`);
        setTableData(prev => ({ ...prev, [tableId]: response.data }));
      } catch (error) {
        console.error("Error fetching table data:", error);
      }
    };

    orders.forEach(order => order.OrderHistory.forEach(history => {
      if (history.itemsStatus === "accepted") {
        fetchTableData(order.tableId);
      }
    }));
  }, [orders, userId, tableData]);

  const handleAction = async () => {
    if (!modal.orderHistoryId || !modal.tableId) return;

    const endpoint = `${API_URL}/api/update-order-status/${userId}/${modal.tableId}/${modal.orderHistoryId}`;
    const data = modal.type === 'cancel' ? { newStatus: "pending" } : { newStatus: "ready" };

    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // toast.success(`Order has been ${modal.type === 'cancel' ? 'canceled' : 'marked as ready'}.`);
        toast.success(t("order_status", {
    title: modal.type === 'cancel' ? t('cancel') : t('ready'),
  }))
        setOrders(prevOrders => prevOrders.map(order => ({
          ...order,
          OrderHistory: order.OrderHistory.filter(history => history._id !== modal.orderHistoryId)
        })));
      } else {
        toast.error("Failed to update order status.");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to process the request.");
    }

    setModal({ open: false, type: null, orderHistoryId: null, tableId: null });
  };

  return (
    <div>
      <ToastContainer position="bottom-right" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 overflow-y-auto">
        {(() => {
          const acceptedHistories = orders
            .flatMap(order =>
              order.OrderHistory
                .filter(history => history.itemsStatus === "accepted")
                .map(history => ({ ...history, tableId: order.tableId }))
            )
            .sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));

          if (acceptedHistories.length === 0) {
            return (
              <div className="col-span-full text-center text-white text-lg mt-10">
                {t('noPreparingOrdersFound')}
              </div>
            );
          }

          return acceptedHistories.map(history => (
            <div key={history._id} className="bg-gray-900 p-2 border-y border-blue-500 rounded-lg shadow-lg">
              <div className="flex justify-between items-center bg-gray-900 p-3 border-b-2 border-gray-500">
                <h1 className="text-white font-semibold">Table: {tableData[history.tableId]?.table?.name || "Loading..."}</h1>
                <p className="text-gray-400 text-sm">{new Date(history.orderDate).toLocaleTimeString()}</p>
              </div>
              <div className="overflow-auto max-h-56">
                <table className="w-full text-sm text-white">
                  <thead className="bg-gray-800 sticky top-0 z-10">
                    <tr className="flex justify-between px-3 py-2 border-b-2 border-gray-700">
                      <th className="flex-1 text-left">{t('items')}</th>
                      <th className="flex-1 text-center">{t('qty')}</th>
                      <th className="flex-1 text-right">{t('unit')}</th>
                    </tr>
                  </thead>
                  <tbody className="block h-40 overflow-y-auto">
                    {history.items.map((item, i) => (
                      <tr key={i} className="flex justify-between px-3 py-2 border-b border-gray-800">
                        <td className="flex-1 text-left">
                          {item.name}
                          {item.instructions && item.instructions.trim() !== "" && (
                            <button
                              className="inline-flex items-center ml-1 text-yellow-400 hover:text-yellow-300"
                              onClick={() => setInstructionModal({ open: true, content: item.instructions })}
                            >
                              <IoMdStar className="inline-block" />
                            </button>
                          )}
                        </td>
                        <td className="flex-1 text-center">{item.quantity}</td>
                        <td className="flex-1 text-right">{item.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center bg-gray-900 gap-2 border-t border-gray-500 p-2">
                <button className="w-full bg-red-700 hover:bg-red-600 text-white py-2 rounded-md transition-all"
                  onClick={() => setModal({ open: true, type: 'cancel', orderHistoryId: history._id, tableId: history.tableId })}>
                  {t('cancelOrder')}
                </button>
                <button className="w-full bg-green-700 hover:bg-green-600 text-white py-2 rounded-md transition-all"
                  onClick={() => {
                    setModal({ open: true, type: 'ready', orderHistoryId: history._id, tableId: history.tableId });
                    playClickSound();
                  }}>
                 {t('ready')}
                </button>
              </div>
            </div>
          ));
        })()}
      </div>

      {modal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <p className="text-gray-400">{t('confirmOrderAction', { action: modal.type === 'cancel' ? t('cancel') : t('ready') })}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="bg-gray-600 px-4 py-2 rounded-md"
                onClick={() => {
                  setModal({ open: false, type: null, orderHistoryId: null, tableId: null });
                  playClickSound();
                }}>
                {t('no')}
              </button>
              <button className={`px-4 py-2 rounded-md ${modal.type === 'cancel' ? 'bg-red-600' : 'bg-green-600'} text-white`}
                onClick={() => {
                  handleAction();
                  playClickSound();
                }}>
                {t('yes')}
              </button>
            </div>
          </div>
        </div>
      )}

      {instructionModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-950 bg-opacity-60 z-50">
          <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-lg font-semibold mb-2">{t('instructions')}</h2>
            <p className="text-gray-300">{instructionModal.content}</p>
            <div className="mt-4 text-right">
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md"
                onClick={() => setInstructionModal({ open: false, content: "" })}
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
