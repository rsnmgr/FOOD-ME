import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CustomerContext } from '../../ContextProvider/CustomerContext';
import axios from 'axios';
import moment from 'moment';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { CustomerId, AdminId, tableId } = useContext(CustomerContext);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [isReportAdded, setIsReportAdded] = useState(false);

  // Fetch order details
  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/fetch-orders/${AdminId}/${tableId}/${CustomerId}`
      );
      const data = await response.json();
      if (response.ok) {
        setOrderDetails(data.orders.OrderHistory || []);
      } else {
        setOrderDetails([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrderDetails([]);
    }
  };

  
  // Add report to the backend
  const addReport = async () => {
    if (orderDetails.length === 0) return;

    const vatRate = 13;
    const totalOrderAmount = orderDetails.reduce((acc, order) => acc + order.total, 0);
    const vatAmount = (totalOrderAmount * vatRate) / 100;
    const totalAfterVAT = totalOrderAmount + vatAmount;

    const reportData = {
      adminId: AdminId,
      tableId,
      CustomerId,
      items: orderDetails.flatMap(order =>
        order.items.map(item => ({
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        }))
      ),
      SubtotalAmmount: totalOrderAmount,
      vatPercentage: vatRate,
      vatAmount,
      Discount: 0, // Assuming no discount for now
      DiscountAmmount: 0,
      totalAmmount: totalAfterVAT,
      paymentType: 'eSewa',
    };

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/add-report`, reportData);
      if (response.status === 200) {
        setIsReportAdded(true);
        // Optionally delete the order after adding the report
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/orders/${AdminId}/${tableId}`);
      }
    } catch (error) {
      console.error("Error adding report:", error);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const encodedData = searchParams.get('data');

    if (encodedData) {
      try {
        const decodedData = atob(encodedData);
        const parsedData = JSON.parse(decodedData);
        setPaymentDetails(parsedData);
      } catch (error) {
        console.error("Error parsing payment data", error);
      }
    }

    // Fetch order details
    if (AdminId && tableId && CustomerId) {
      fetchOrders();
    }
  }, [location.search, AdminId, tableId, CustomerId]);

  useEffect(() => {
    // Automatically add the report once the order details are fetched
    if (orderDetails.length > 0 && !isReportAdded) {
      addReport();
    }
  }, [orderDetails, isReportAdded]);

  if (!paymentDetails) {
    return <p className="text-center mt-10 text-gray-300">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-3xl text-white">
        <div className="flex flex-col items-center text-center">
          <div className="bg-green-500 rounded-full p-4 mb-6 shadow-md">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-green-400 mb-2">Payment Successful</h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-xl mb-6">
            Thank you for your payment. Your transaction has been completed successfully.
          </p>
        </div>

        {/* Payment Details */}
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full table-auto border border-gray-700 rounded-md">
            <thead>
              <tr className="bg-gray-700 text-gray-300 text-sm">
                <th className="py-2 px-4 text-left border-b border-gray-600">Detail</th>
                <th className="py-2 px-4 text-left border-b border-gray-600">Value</th>
              </tr>
            </thead>
            <tbody className="text-gray-200 text-sm">
              <tr>
                <td className="py-2 px-4 font-semibold border-b border-gray-700">Transaction Code</td>
                <td className="py-2 px-4 border-b border-gray-700">{paymentDetails.transaction_code}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-semibold border-b border-gray-700">Total Amount</td>
                <td className="py-2 px-4 border-b border-gray-700">{paymentDetails.total_amount}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-semibold border-b border-gray-700">Status</td>
                <td className="py-2 px-4 border-b border-gray-700">{paymentDetails.status}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Order Details
        <div className="overflow-x-auto mb-6">
          <h2 className="text-lg font-bold text-green-400 mb-4">Order Details</h2>
          <table className="min-w-full table-auto border border-gray-700 rounded-md">
            <thead>
              <tr className="bg-gray-700 text-gray-300 text-sm">
                <th className="py-2 px-4 text-left border-b border-gray-600">Item</th>
                <th className="py-2 px-4 text-left border-b border-gray-600">Quantity</th>
                <th className="py-2 px-4 text-left border-b border-gray-600">Price</th>
              </tr>
            </thead>
            <tbody className="text-gray-200 text-sm">
              {orderDetails.map((order) =>
                order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b border-gray-700">{item.name}</td>
                    <td className="py-2 px-4 border-b border-gray-700">{item.quantity}</td>
                    <td className="py-2 px-4 border-b border-gray-700">{item.price}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div> */}

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate('/menu')}
            className="w-full sm:w-40 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
          >
            Back Home
          </button>
          <button
            onClick={() => navigate('/menu/histry')}
            className="w-full sm:w-40 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition"
          >
            My Bill
          </button>
        </div>
      </div>
    </div>
  );
}