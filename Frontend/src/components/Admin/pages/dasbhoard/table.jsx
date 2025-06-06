import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { LoginContext } from '../../../ContextProvider/Context';
import axios from 'axios';
import { io } from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdOutlinePreview } from 'react-icons/md';

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);
export default function Orders({ userRole }) {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [tableData, setTableData] = useState({});
  const [modal, setModal] = useState({ open: false, orderItems: [], totalAmount: 0, tableName: "", orderDate: "" });
  const { loginData } = useContext(LoginContext);
  const userId = userRole === "admin"
  ? loginData?.validUser?._id
  : loginData?.validUser?.AdminId;

  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/fetch-orders/${userId}`);
        setOrders(response.data.orders || []);
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

    orders.forEach(order => fetchTableData(order.tableId));
  }, [orders, userId, tableData]);

  const handleViewOrderItems = (orderHistory) => {
    const tableName = tableData[orderHistory.tableId]?.table?.name || "Loading...";
    const orderDate = new Date(orderHistory.orderDate).toLocaleString();

    setModal({
      open: true,
      orderItems: orderHistory.items,
      totalAmount: orderHistory.totalAmount,
      tableName: tableName,
      orderDate: orderDate,
    });
  };

  const handleCloseModal = () => {
    setModal({ open: false, orderItems: [], totalAmount: 0, tableName: "", orderDate: "" });
  };

  return (
    <div className="overflow-x-auto h-[70vh]">
       <ToastContainer position="bottom-right" />
      <h1 className="mb-3">Live Order Details - <span className='text-xl text-green-700 font-extrabold'>{orders.reduce((total, order) => total + (order.OrderHistory?.length || 0), 0)}</span></h1>
      <table className="min-w-full divide-y divide-gray-500">
        <thead className="bg-gray-800 sticky top-0 z-10">
          <tr>
            {[
              { short: t('sn'), full: 'Serial Number' },
              { short: t('table_name'), full: 'Supplier Name' },
              { short: t('total_items'), full: 'Item' },
              { short: t('total_price'), full: 'Total Price' },
              { short: t('status'), full: 'Status' },
              { short: t('date'), full: 'Date of order' },
              { short: t('action'), full: 'Actions' }
            ].map(({ short, full }) => (
              <th
                key={short}
                className="px-6 py-3 text-center text-sm font-medium uppercase tracking-wider text-gray-100"
                title={full}
              >
                {short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-gray-900 divide-y divide-gray-700 ">
        {orders.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                Currently no order found
              </td>
            </tr>
          ) : (
          orders
            .flatMap(order => 
              order.OrderHistory.map(history => ({
                ...history,
                tableId: order.tableId,  // Include tableId for sorting reference
              }))
            )
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)) // Sort by order date (newest first)
            .map((history, index) => (
              <tr key={history._id} className="text-slate-200">
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{index + 1}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{tableData[history.tableId]?.table?.name || "Loading..."}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{history.items.length}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{history.total || 0}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                  <button type="button" className={`px-3 py-1 rounded-full font-medium capitalize transition duration-200 hover:brightness-110 ${
                    history.itemsStatus === 'pending'
                      ? 'bg-amber-500 text-white'
                      : history.itemsStatus === 'accepted'
                      ? 'bg-blue-500 text-white'
                      : history.itemsStatus === 'ready'
                      ? 'bg-emerald-500 text-white'
                      : history.itemsStatus === 'finished'
                      ? 'bg-slate-600 text-white'
                      : 'bg-gray-500 text-white'
                  }`}>
                    {history.itemsStatus || 'Pending'}
                  </button>
                </td>                <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{new Date(history.orderDate).toLocaleString()}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm flex justify-center gap-2">
                  <MdOutlinePreview 
                    className="text-2xl text-green-700 cursor-pointer"
                    title="View"
                    onClick={() => handleViewOrderItems(history)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {modal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96  border border-gray-500">
            <div className="flex justify-between items-center bg-gray-800 p-3 border-b-2 border-gray-500 ">
              <h1 className="text-white font-semibold">Table: {modal.tableName}</h1>
              <p className="text-gray-400 text-sm">{modal.orderDate}</p>
            </div>
            <div className="overflow-auto max-h-56">
              <table className="w-full text-sm text-white">
                <thead className="bg-gray-800 sticky top-0 z-10">
                  <tr className="flex justify-between px-3 py-2 border-b-2 border-gray-700">
                    <th className="flex-1 text-left">Item</th>
                    <th className="flex-1 text-center">Quantity</th>
                    <th className="flex-1 text-right">Units</th>
                  </tr>
                </thead>
                <tbody className="block h-40 overflow-y-auto">
                {modal.orderItems.map((item, index) => (
                    <tr key={index} className="flex justify-between px-3 py-2 border-b border-gray-800">
                      <td className="flex-1 text-left">{item.name}</td>
                      <td className="flex-1 text-center">{item.quantity}</td>
                      <td className="flex-1 text-right">{item.size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center  gap-2 border-t border-gray-500 p-2">
              <button className="w-full bg-gray-700 text-white py-2 rounded-md transition-all" 
                onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
