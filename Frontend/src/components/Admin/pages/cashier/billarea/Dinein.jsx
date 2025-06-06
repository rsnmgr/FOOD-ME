import { useContext, useState, useEffect } from "react";
import { FaUsersLine } from "react-icons/fa6";
import { IoIosStar } from "react-icons/io";
import { LoginContext } from '../../../../ContextProvider/Context';
import axios from "axios";
import moment from 'moment';
import { io } from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CiCalculator2 } from "react-icons/ci";
import Calculator from './Dinein/calculator';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

export default function Dinein({ setSelectedTable, userRole, playClickSound,userData }) {
  const { loginData } = useContext(LoginContext);
  const AdminId = userRole === "admin"
    ? loginData?.validUser?._id
    : loginData?.validUser?.AdminId;
  const { t } = useTranslation();
  const [tableData, setTableData] = useState(null);
  const [orderData, setOrderData] = useState({ items: [], totalOrderAmount: 0 });
  const [discount, setDiscount] = useState(0);
  const [paymentType, setPaymentType] = useState("Cash");
  const [settlement, setSettlement] = useState(false);
  const [calculator, setCalculator] = useState(false);
  const tableId = localStorage.getItem("selectedTableId");

  const vatRate = 13;
  const vatAmount = (orderData.totalOrderAmount * vatRate) / 100;
  const subtotalWithVAT = orderData.totalOrderAmount + vatAmount;
  const discountAmount = (subtotalWithVAT * discount) / 100;
  const totalAfterDiscount = (subtotalWithVAT - discountAmount).toFixed(2);

  useEffect(() => {
    if (!AdminId || !tableId) return;

    setOrderData({ items: [], totalOrderAmount: 0 });

    const fetchOrderData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/fetch-orders/${AdminId}/${tableId}`);
        const data = await response.json();
        const orders = data.orders?.OrderHistory || [];

        const aggregatedItems = orders.reduce((acc, order) => {
          order.items.forEach(item => {
            const key = `${item.name}-${item.size}`;
            if (acc[key]) {
              acc[key].quantity += item.quantity;
              acc[key].subtotal += item.price * item.quantity;
            } else {
              acc[key] = { ...item, subtotal: item.price * item.quantity };
            }
          });
          return acc;
        }, {});

        const items = Object.values(aggregatedItems);
        const totalOrderAmount = data.orders?.totalOrderAmount || 0;
        const orderDate = data.orders?.orderDate || null;
        const CustomeriD = data.orders?.CustomerId;

        setOrderData({ items, totalOrderAmount, orderDate, CustomeriD });
      } catch (error) {
        console.error("Error fetching order data:", error);
      }
    };

    const fetchTableData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tables/${AdminId}/${tableId}`);
        setTableData(response.data);
      } catch (error) {
        console.error("Error fetching table data:", error);
      }
    };

    fetchOrderData();
    fetchTableData();

    socket.on("orderAdded", fetchOrderData);
    socket.on("orderUpdated", fetchOrderData);
    socket.on("orderRemoved", fetchOrderData);
    socket.on("orderHistoryRemoved", fetchOrderData);
    socket.on("orderItemRemoved", fetchOrderData);

    return () => {
      socket.off("orderAdded", fetchOrderData);
      socket.off("orderUpdated", fetchOrderData);
      socket.off("orderRemoved", fetchOrderData);
      socket.off("orderHistoryRemoved", fetchOrderData);
      socket.off("orderItemRemoved", fetchOrderData);
    };
  }, [AdminId, tableId]);

  const addReport = async () => {
    const reportData = {
      adminId: AdminId,
      tableId,
      CustomerId: orderData.CustomeriD,
      items: orderData.items.map(item => ({
        name: item.name,
        size: item.size,
        quantity: item.quantity,
        price: item.price
      })),
      SubtotalAmmount: orderData.totalOrderAmount,
      vatPercentage: vatRate,
      vatAmount: vatAmount,
      Discount: discount,
      DiscountAmmount: discountAmount,
      totalAmmount: totalAfterDiscount,
      paymentType,
      status: "paid"
    };

    try {
      const response = await axios.post(`${API_URL}/api/add-report`, reportData);
      await axios.delete(`${API_URL}/api/orders/${AdminId}/${tableId}`);
      // toast.success(response.data.message);
      toast.info((t('bill_settled')));
      setSettlement(false);
      setDiscount(0);
    } catch (error) {
      // toast.error(error.response?.data?.message || "Failed to settle.");
      toast.error(t('bill_settlement_error'));
      setSettlement(false);
    }
  };

  const printBill = async () => {
    // Print the bill content after the report is successfully added
    const billContent = document.getElementById('printableBill');
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Bill</title>');
    printWindow.document.write('<style>@media print { body { font-family: Arial, sans-serif; padding: 10px; } }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(billContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };
  

  return (
    <div className="relative h-full flex flex-col bg-gray-900">
       <ToastContainer position="bottom-left" />

      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-800 py-1">
        <ul className="flex justify-between items-center">
          <li className="p-2 px-6 border border-gray-700 text-sm cursor-pointer">{tableData?.table?.name || t('na')}</li>
          <li className="p-2 px-6 border border-gray-700 text-sm cursor-pointer"><FaUsersLine size={20} /></li>
          <li className="p-2 px-6 border border-gray-700 text-sm cursor-pointer"><IoIosStar size={20} /></li>
          <li className="p-2 px-6 border border-gray-700 text-sm cursor-pointer" onClick={() => { playClickSound(); setCalculator(true) }}><CiCalculator2 size={20} /></li>
        </ul>
        <span>{orderData.orderDate ? moment(orderData.orderDate).format('hh:mm:ss A') : ""}</span>
      </div>

      {/* Main Table */}
      <div className="flex-grow overflow-x-auto">
  <div className="border-x border-gray-700 rounded-t-lg overflow-hidden">
    <table className="w-full text-sm text-left table-fixed">
      <thead className="text-xs uppercase bg-gray-800 sticky top-0 z-10">
        <tr>
          <th className="px-6 py-3">{t('product') + ' ' + t('name')}</th>
          <th className="px-6 py-3 text-center">{t('qty')}</th>
          <th className="px-6 py-3 text-center">{t('price')}</th>
        </tr>
      </thead>
    </table>

    {/* Scrollable tbody container */}
    <div className="overflow-y-auto bg-gray-900" style={{ maxHeight: '50vh', paddingBottom: '20vh' }}>
      <table className="w-full text-sm text-left table-fixed">
        <tbody className="">
          {orderData.items.length === 0 ? (
            <tr>
              <td colSpan="3" className="px-6 py-2 text-center text-gray-500">
                {t('tableIsBlank')}
              </td>
            </tr>
          ) : (
            orderData.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-800">
                <td className="px-6 py-2 text-white">{item.name} ({item.size})</td>
                <td className="px-6 py-2 text-center">{item.quantity}</td>
                <td className="px-6 py-2 text-center">
                  {item.subtotal.toFixed(2)}
                  <span className="block text-gray-500">{item.price.toFixed(2)}</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>


      {/* Payment and Actions */}
      <footer className="absolute bottom-0 left-0 right-0 w-full bg-gray-900 mt-1 z-50">
        {/* Totals Table */}
          <table className="w-full text-sm text-left table-fixed border-b border-gray-600">
            <tfoot className="bg-gray-800">
              <tr className="font-semibold text-white">
                <td className="px-6 pt-2 text-sm">{t('subTotal')}</td>
                <td className="px-6 pt-2 text-center">{orderData.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                <td className="px-6 pt-2 text-center">{orderData.totalOrderAmount.toFixed(2)}</td>
              </tr>
              <tr className="font-semibold text-white">
                <td className="px-6 text-sm">{t('vat')} (13%)</td>
                <td></td>
                <td className="px-6 text-center">{vatAmount.toFixed(2)}</td>
              </tr>
              <tr className="font-semibold text-white">
                <td className="px-6 text-sm">{t('discount')}(%)</td>
                <td className="px-6 text-sm pb-2 text-center">
                  <input
                    className="w-1/4 outline-none border-b border-dashed bg-gray-800 text-center text-white"
                    placeholder="Discount %"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  />
                </td>
                <td className="px-6 text-center">- {discountAmount.toFixed(2)}</td>
              </tr>
              <tr className="font-semibold text-white bg-gray-900">
                <td className="px-6 py-2 text-sm">{t('total')}</td>
                <td></td>
                <td className="px-6 py-2 text-center">{totalAfterDiscount}</td>
              </tr>
            </tfoot>
          </table>
        <div className="flex justify-between items-center px-6 py-2 bg-gray-800">
          {["Cash", "Card", "Due", "Other"].map((type) => (
            <label key={type} className="text-white cursor-pointer">
              <input type="radio" value={type} checked={paymentType === type} onChange={() => { playClickSound(); setPaymentType(type) }} /> {type}
            </label>
          ))}
        </div>
        <div className="flex justify-between md:justify-end items-center p-1">
          <button className="md:hidden p-2 px-4 bg-gray-800 text-white" onClick={() => setSelectedTable(null)}>Back</button>
          <div className="space-x-2">
            <button className="p-2 bg-green-700 text-white" onClick={() => { playClickSound(); setSettlement(true) }}>{t('settlement')}</button>
            <button className="p-2 bg-green-900 text-white" onClick={() => { playClickSound(); printBill() }}>{t('printBill')}</button>
          </div>
        </div>
      </footer>

      {/* Settlement Modal */}
      {settlement && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-70 z-50 flex justify-center items-center">
        <div className="bg-gray-800 p-4 rounded-lg">
        <p>{t('confirmProceed')}</p>
        <div className="flex justify-end mt-4">
        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={addReport}>{t('yes')}</button>
        <button className="ml-2 px-4 py-2 bg-gray-600 rounded" onClick={() => setSettlement(false)}>{t('no')}</button>
        </div>
        </div>
        </div>
        )}

        {/* Calculator Modal */}
      {calculator && (
        <div className="absolute top-0 left-0 w-full h-full bg-gray-900 bg-opacity-90 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg space-y-4">
            <Calculator setCalculator={setCalculator} tableData={tableData} totalAfterDiscount={totalAfterDiscount} playClickSound={playClickSound} />
          </div>
        </div>
      )}
        {/* Hidden Printable Area */}
        <div id="printableBill" className="hidden text-black" style={{ fontFamily: 'Arial, sans-serif', padding: '20px', fontSize: '14px' }}>
        <h1 style={{ textAlign: 'center', margin: 0 }}>{userData?.customer?.restaurant}</h1>
        <h2 style={{ textAlign: 'center', margin: '4px 0' }}>({userData?.customer?.address})</h2>
        <h3 style={{ textAlign: 'center', margin: '4px 0', fontWeight: 'normal' }}>{userData?.customer?.phone} | {userData?.customer?.email}</h3>

        <hr style={{ margin: '10px 0' }} />

        <p><strong>Table:</strong> {tableData?.table?.name || t('na')}</p>
        <p><strong>Order Time:</strong> {orderData.orderDate ? moment(orderData.orderDate).format('LLL') : t('na')}</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }} border="1">
          <thead>
            <tr>
              <th style={{ padding: '8px' }}>Item</th>
              <th style={{ padding: '8px' }}>Size</th>
              <th style={{ padding: '8px' }}>Qty</th>
              <th style={{ padding: '8px' }}>Price</th>
              <th style={{ padding: '8px' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {orderData.items.map((item, index) => (
              <tr key={index}>
                <td style={{ padding: '8px' }}>{item.name}</td>
                <td style={{ padding: '8px' }}>{item.size}</td>
                <td style={{ padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{item.price.toFixed(2)}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section in Table Format */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }} border="1">
          <tbody>
            <tr>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Subtotal</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{orderData.totalOrderAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>VAT (13%)</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{vatAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Discount ({discount}%)</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>- {discountAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Total</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{totalAfterDiscount}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Payment Type</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{paymentType}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p>Thank you for dining with us!</p>
          <p>Visit Again!</p>
        </div>
      </div>
    </div>
  );
}