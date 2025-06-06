import { useState, useEffect, useContext } from "react";
import { v4 as uuidv4 } from 'uuid';
import CryptoJs from 'crypto-js';
import { useNavigate } from "react-router-dom";
import { CustomerContext } from "../../ContextProvider/CustomerContext";
import moment from "moment";
import { MdOutlineAutoDelete } from "react-icons/md";
import io from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);
import { useTranslation } from 'react-i18next';

export default function Bill() {
  const navigate = useNavigate();
  const { customerData, CustomerId, AdminId, tableId } = useContext(CustomerContext);
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [deleteOrderForm, setDeleteOrderForm] = useState(null);
  const [esewapayment, setEsewapayment] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    tax_amount: 0,
    total_amount: 0,
    transaction_uuid: "",
    product_code: "EPAYTEST",
    product_service_charge: 0,
    product_delivery_charge: 0,
    success_url: `${window.location.origin}/menu/paymentSuccess`,
    failure_url: `${window.location.origin}/menu/paymentFail`,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature: "",
    secret: "8gBm/:&EnhH.1/q",
  });

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/fetch-orders/${AdminId}/${tableId}/${CustomerId}`);
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders.OrderHistory || []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      setOrders([]);
    }
  };

  useEffect(() => {
    if (AdminId && tableId && CustomerId) fetchOrders();
  }, [AdminId, tableId, CustomerId]);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const total = orders.reduce((acc, order) => acc + order.total, 0);
    const taxAmount = 0;
    const totalAmount = total + taxAmount;
    const transaction_uuid = uuidv4();
    const signedText = `total_amount=${totalAmount},transaction_uuid=${transaction_uuid},product_code=EPAYTEST`;
    const signature = CryptoJs.HmacSHA256(signedText, paymentData.secret).toString(CryptoJs.enc.Base64);

    setPaymentData(prev => ({
      ...prev,
      amount: total,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      transaction_uuid,
      signature,
    }));
  }, [orders]);

  const deleteOrderItem = async (orderHistoryId, itemId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/order/item/delete/${AdminId}/${tableId}/${orderHistoryId}/${itemId}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (response.ok) {
        setDeleteOrderForm(null);
      }
    } catch (error) {}
  };

  const handleDeleteOrderItem = (orderHistoryId, itemId) => {
    deleteOrderItem(orderHistoryId, itemId);
  };

  const allOrdersFinished = orders.every(order => order.itemsStatus === "Finished");
  const { t} = useTranslation('customer');

  return (
    <div>
      <div className="space-y-4">
        <p className="text-center p-4 text-xl font-semibold">{t('bill.yourTotalOrders')}</p>
        <h1 className="text-center text-2xl font-bold text-green-500">
          Rs. {orders.reduce((acc, order) => acc + order.total, 0)}
        </h1>
        <div className="p-4 overflow-y-auto" style={{ maxHeight: "375px" }}>
          {orders.length === 0 ? (
            <p className="text-center text-gray-500">No orders found</p>
          ) : (
            orders.map((order) => (
              <div className="relative" key={order._id}>
                <div
                  className="flex justify-between items-center bg-gray-900 p-3 mt-2 rounded-md cursor-pointer"
                  onClick={() => setExpandedOrderId(prev => prev === order._id ? null : order._id)}
                >
                  <div className="text-xs text-white space-y-1">
                    <div className="flex justify-between items-center">
                      <label>{moment(order.orderDate).format("hh:mm A")}</label>
                      <h1 className={`underline ${order.itemsStatus === "prepare" ? "text-gray-500" : "text-green-500"}`}>
                        {order.itemsStatus}
                      </h1>
                    </div>
                    <h1>{order._id}</h1>
                  </div>
                <div className="text-white">{order.items.length} {t('bill.items')}</div>
                  <div className="text-white">{t('bill.currency')}. {order.total}</div>
                </div>

                {expandedOrderId === order._id && (
                  <div className="p-4 bg-gray-800 mt-2 rounded-md text-white">
                    <h3 className="mb-2 font-medium">{t('bill.orderDetails')}</h3>
                    <ul className="space-y-2 text-sm">
                      {order.items.map((item) => (
                        <li key={item._id} className="flex justify-between items-center gap-2">
                          <span>{item.name} ({item.size})</span>
                          <span>{item.quantity} x {item.price}</span>
                          {order.itemsStatus === "pending" && (
                            <button
                              className="text-red-600 hover:text-red-800"
                              aria-label="Delete item"
                              onClick={() => setDeleteOrderForm({ orderHistoryId: order._id, itemId: item._id })}
                            >
                              <MdOutlineAutoDelete size={20} />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex justify-between p-4 gap-2">
          <button className="p-2 w-full bg-gray-900 text-white rounded" onClick={() => navigate(`/menu`)}>{t('bill.newOrder')}</button>
          <button
            className={`p-2 w-full rounded cursor-not-allowed  ${
              allOrdersFinished ? "bg-green-800 text-white" : "bg-gray-800 text-gray-300 cursor-not-allowed"
            }`}
            onClick={() => setEsewapayment(true)}
            // disabled={!allOrdersFinished}
            // title={!allOrdersFinished ? "Payment allowed only when all orders are finished." : ""}
            disabled
          >
            {t('bill.paid')}
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 d border border-gray-600  w-full max-w-md p-6 rounded-xl shadow-2xl space-y-4">
            <h2 className="text-xl font-semibold">{t('bag.confirmDelete')}</h2>
            <p className="text-gray-600 dark:text-gray-300">{t('bag.confirmDeleteText')}</p>
            <div className="flex justify-between items-center space-x-3">
              <button className="bg-gray-700 text-white py-2 w-1/2 rounded" onClick={() => setDeleteOrderForm(null)}>{t('bag.cancel')}</button>
              <button className="bg-red-600 text-white py-2 w-1/2 rounded" onClick={() => handleDeleteOrderItem(deleteOrderForm.orderHistoryId, deleteOrderForm.itemId)}>{t('bag.delete')}</button>
            </div>
          </div>
        </div>
      )}

      {/* eSewa Payment Modal */}
      {esewapayment && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 d border border-gray-600  w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-4">
            <h2 className="text-xl font-semibold text-center  dark:text-white mb-4">eSewa Payment</h2>
            <form action="https://rc-epay.esewa.com.np/api/epay/main/v2/form" method="POST" className="space-y-3">
              <input type="hidden" name="amount" value={paymentData.amount} />
              <input type="hidden" name="tax_amount" value={paymentData.tax_amount} />
              <input type="hidden" name="total_amount" value={paymentData.total_amount} />
              <input type="hidden" name="transaction_uuid" value={paymentData.transaction_uuid} />
              <input type="hidden" name="product_code" value={paymentData.product_code} />
              <input type="hidden" name="product_service_charge" value="0" />
              <input type="hidden" name="product_delivery_charge" value="0" />
              <input type="hidden" name="success_url" value={paymentData.success_url} />
              <input type="hidden" name="failure_url" value={paymentData.failure_url} />
              <input type="hidden" name="signed_field_names" value={paymentData.signed_field_names} />
              <input type="hidden" name="signature" value={paymentData.signature} />

              <div className="text-gray-300  text-sm mb-2">
                <p>Total Payable: <span className="font-semibold text-lg">Rs. {paymentData.total_amount}</span></p>
              </div>

              <div className="flex space-x-3">
                <button type="button" className="w-1/2 bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-lg" onClick={() => setEsewapayment(false)}>Cancel</button>
                <button type="submit" className="w-1/2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg">Pay Now</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}