import { useContext, useEffect, useState } from 'react';
import { CustomerContext } from '../../ContextProvider/CustomerContext';
import { io } from "socket.io-client";
import { LuSearch} from 'react-icons/lu';
import moment from 'moment';
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);
import {playClickSound} from '../../ClickSound/click'
import { useTranslation } from 'react-i18next';

export default function Histry() {
  const { CustomerId, AdminId,userData } = useContext(CustomerContext);
  const [tableData, setTableData] = useState({});
  const [sales, setSales] = useState([]);
  const [customDateModal, setCustomDateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [openItems, setOpenItems] = useState(null);
  const navigate = useNavigate();
  const { t} = useTranslation('customer');


  useEffect(() => {
    if (!CustomerId || !AdminId) return;

    const fetchOrdersHistory = async () => {
      try {
        const response = await fetch(`${API_URL}/api/sales/${AdminId}/${CustomerId}`);
        const data = await response.json();
        if (Array.isArray(data.sales)) {
          setSales(data.sales);
          data.sales.forEach(({ tableId }) => fetchTableName(tableId));
        }
      } catch (error) {
        console.error("Error fetching sales:", error);
      }
    };

    const fetchTableName = async (tableId) => {
      if (tableData[tableId]) return;
      try {
        const response = await fetch(`${API_URL}/api/tables/${AdminId}/${tableId}`);
        if (response.ok) {
          const table = await response.json();
          setTableData(prev => ({ ...prev, [tableId]: table.table.name }));
        }
      } catch (err) {
        console.error("Table fetch failed", err);
      }
    };

    fetchOrdersHistory();
    socket.on("reportAdded", fetchOrdersHistory);
    socket.on("saleDeleted", fetchOrdersHistory);

    return () => {
      socket.off("reportAdded", fetchOrdersHistory);
      socket.off("saleDeleted", fetchOrdersHistory);
    };
  }, [CustomerId, AdminId]);

  const getFilteredSales = (sales, filter) => {
    const now = moment();
    switch (filter) {
      case 'days':
        return sales.filter(s => moment(s.date).isSame(now, 'day'));
      case 'weekly':
        return sales.filter(s => moment(s.date).isSameOrAfter(now.clone().subtract(7, 'days')));
      case 'monthly':
        return sales.filter(s => moment(s.date).isSameOrAfter(now.clone().subtract(30, 'days')));
      case 'custom':
        return sales.filter(s => moment(s.date).isBetween(moment(startDate), moment(endDate), undefined, '[]'));
      default:
        return sales;
    }
  };

  const filteredSales = getFilteredSales(sales, filter).filter(sale =>
    tableData[sale.tableId]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = filteredSales.reduce((sum, s) => sum + s.totalAmmount, 0);


  const printInvoice = (openItems) => {
    const subtotal = openItems.SubtotalAmmount;
    const vat = openItems.vatAmount;
    const discountAmount = openItems.DiscountAmmount;
    const total = openItems.totalAmmount;
    const paymentType = openItems.paymentType;
  
    // Open a new window with about:blank to avoid the blank page
    const newWindow = window.open('about:blank', '', 'width=800,height=600');
    if (!newWindow) {
      alert("Please allow popups for this page.");
      return;
    }
  
    // Write the HTML content to the new window
    // ${userData.image ? `<img src="${API_URL}/${userData.image}" class="logo" />` : ''}

    newWindow.document.write(`
      <html>
        <head>
          <title>${t('orderhistry.invoice')}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 30px; color: #333; background-color: #f8f8f8; }
            .header { text-align: center; margin-bottom: 20px; }
            .logo { max-height: 80px; margin-bottom: 10px; }
            .details { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f2f2f2; }
            .totals { margin-top: 20px; width: 100%; text-align: right; }
            .totals td { font-weight: bold; padding: 8px; }
            .footer { margin-top: 30px; text-align: center; font-size: 16px; color: #555; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${userData.restaurant || 'Restaurant Name'}</h2>
            <p>${userData.address || ''}</p>
            <p>${userData.phone || ''} | ${userData.email || ''}</p>
          </div>
  
          <div class="details">
            <strong>${t('orderhistry.invoiceDate')}:</strong> ${moment(openItems.date).format('DD MMM YYYY, hh:mm A')}<br />
            ${openItems.tableName ? `<strong>Table:</strong> ${openItems.tableName}<br />` : ''}
            <strong>${t('orderhistry.paymentType')}:</strong> ${paymentType}<br />
          </div>
  
          <table>
            <thead>
              <tr><th>${t('orderhistry.items')}</th><th>${t('orderhistry.size')}</th><th>${t('orderhistry.qty')}</th><th>${t('orderhistry.rate')}</th><th>${t('orderhistry.price')}e</th></tr>
            </thead>
            <tbody>
              ${openItems.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.size}</td>
                  <td>${item.quantity}</td>
                  <td>${item.price}</td>
                  <td>${(item.price * item.quantity)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
  
          <table class="totals">
            <tr><td>${t('orderhistry.subTotal')}:</td><td>${subtotal.toFixed(2)}</td></tr>
            <tr><td>${t('orderhistry.vat')} (${openItems.vatPercentage}%):</td><td>${vat.toFixed(2)}</td></tr>
            <tr><td>${t('orderhistry.discountAmount')} (${openItems.Discount}%):</td><td>- ${discountAmount.toFixed(2)}</td></tr>
            <tr><td>${t('home.total')}:</td><td>${total.toFixed(2)}</td></tr>
          </table>
  
          <div class="footer">
            <p>${t('orderhistry.thankYouMessage')}</p>
          </div>
        </body>
      </html>
    `);
  
    // Close the document to ensure content is fully loaded
    newWindow.document.close();
  
    // Trigger the print dialog after the content has loaded
    newWindow.print();
  };
  
  const printAllInvoices = () => {
    if (filteredSales.length === 0) return;
  
    // Open a new window with about:blank to avoid the blank page
    const newWindow = window.open('about:blank', '', 'width=900,height=700');
    if (!newWindow) {
      alert("Please allow popups for this page.");
      return;
    }
  
    // Write the HTML content for all invoices
    newWindow.document.write(`
      <html>
        <head>
          <title>${t('orderhistry.invoice')}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              padding: 30px;
              color: #333;
              background-color: #f8f8f8;
            }
            .invoice {
              page-break-after: always;
              border-bottom: 2px dashed #ccc;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 15px;
            }
            .logo { max-height: 60px; margin-bottom: 5px; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .totals {
              margin-top: 15px;
              width: 100%;
              text-align: right;
            }
            .totals td { font-weight: bold; padding: 8px; }
            .footer { margin-top: 30px; text-align: center; font-size: 16px; color: #555; font-weight: bold; }
            .total {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 20px;
              padding: 10px;
              background-color: #f2f2f2;
              border-radius: 5px;
              font-weight: bold;
              font-size: 18px;
            }
          </style>
        </head>
        <body>
          ${filteredSales.map((order) => {
            return `
              <div class="invoice">
                <div class="header">
                  ${userData.image ? `<img src="${API_URL}/${userData.image}" class="logo" />` : ''}
                  <h3>${userData.restaurant || 'Restaurant Name'}</h3>
                  <p>${userData.address || ''}</p>
                  <p>${userData.phone || ''} | ${userData.email || ''}</p>
                </div>
                <p><strong>${t('orderhistry.date')}:</strong> ${moment(order.date).format('DD MMM YYYY, hh:mm A')}</p>
                <p><strong>${t('orderhistry.tableName')}:</strong> ${tableData[order.tableId]}</p>
                <p><strong>${t('orderhistry.paymentType')}:</strong> ${order.paymentType}</p>
  
                <table>
                  <thead>
                    <tr>
                      <th>${t('orderhistry.items')}</th>
                      <th>${t('orderhistry.size')}</th>
                      <th>${t('orderhistry.qty')}</th>
                      <th>${t('orderhistry.rate')}</th>
                      <th>${t('orderhistry.price')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${order.items.map(item => `
                      <tr>
                        <td>${item.name}</td>
                        <td>${item.size}</td>
                        <td>${item.quantity}</td>
                        <td>${item.price}</td>
                        <td>${(item.price * item.quantity)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
  
                <table class="totals">
                  <tr><td>${t('orderhistry.subTotal')}:</td><td>${order.SubtotalAmmount.toFixed(2)}</td></tr>
                  <tr><td>${t('orderhistry.vat')}(13%):</td><td>${order.vatAmount.toFixed(2)}</td></tr>
                  <tr><td>${t('orderhistry.discountAmount')} (${order.Discount}%):</td><td>- ${order.DiscountAmmount.toFixed(2)}</td></tr>
                  <tr><td><strong>${t('home.total')}:</strong></td><td><strong>${order.totalAmmount.toFixed(2)}</strong></td></tr>
                </table>
              </div>
            `;
          }).join('')}
          <div class="total">
            <p>${t('orderhistry.totalAmount')}</p>
            <span>₹${totalAmount.toFixed(2)}</span>
          </div>
          <div class="footer">
            <p>${t('orderhistry.thankYouMessage')}</p>
          </div>
        </body>
      </html>
    `);
  
    // Close the document to ensure content is fully loaded
    newWindow.document.close();
  
    // Trigger the print dialog after the content has loaded
    newWindow.print();
  };
  
  
  
  return (
    <div className='p-2 space-y-4'>
      <div className='md:flex justify-between items-center'>
        <div className='flex justify-between items-center gap-2'>
          <h1 className='text-md font-bold'>{t('orderhistry.orderHistory')}</h1>
          <h2 className='text-xl font-bold'>({sales.length})</h2>
        </div>
        <div className='flex flex-between gap-3 mt-3 md:mt-0'>
          <div className="relative w-64">
            <LuSearch className="absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              className="w-full pl-10 p-2 bg-gray-900 text-slate-200 border border-gray-800 rounded-lg outline-none"
              placeholder={t('orderhistry.searchByTableName')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="bg-gray-900 text-white p-2 border border-gray-800 rounded"
            value={filter}
            onChange={(e) => {
              if (e.target.value === 'custom') setCustomDateModal(true); 
              else setFilter(e.target.value); playClickSound();
            }}
          >
            <option value="all">{t('home.all')}</option>
            <option value="days">{t('orderhistry.today')}</option>
            <option value="weekly">{t('orderhistry.thisWeek')}</option>
            <option value="monthly">{t('orderhistry.thisMonth')}</option>
            <option value="custom">{t('orderhistry.custom')}</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto h-[65vh] rounded-md border border-gray-700">
        <table className="min-w-full bg-white divide-y divide-gray-200">
          <thead className="bg-gray-800 sticky top-0 z-10">
            <tr>
              {[
                'sn', 'tableName', 'items', 'subTotal', 'discountPercentage',
                'discountAmount', 'totalAmount', 'paymentType','date', 'action'
              ].map((col) => (
                <th key={col} className="px-6 py-3 text-sm text-gray-100 text-center uppercase">
                 {t(`orderhistry.${col}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700 text-slate-200">
            {filteredSales.length > 0 ? filteredSales.map((sale, index) => (
              <tr key={index}>
                <td className="px-6 py-3 text-center">{index + 1}</td>
                <td className="px-6 py-3 text-center">{tableData[sale.tableId] || 'Loading...'}</td>
                <td className="px-6 py-3 text-center">{sale.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                <td className="px-6 py-3 text-center">{sale.SubtotalAmmount}</td>
                <td className="px-6 py-3 text-center">{sale.Discount}%</td>
                <td className="px-6 py-3 text-center">{sale.DiscountAmmount}</td>
                <td className="px-6 py-3 text-center">{sale.totalAmmount}</td>
                <td className="px-6 py-3 text-center">{sale.paymentType}</td>
                <td className="px-6 py-3 text-center">{moment(sales.date).format('DD/MM/YYYY hh:mm A')}</td>
                <td className="px-6 py-3 text-center">
                  <button onClick={() => {setOpenItems(sale);playClickSound()}} className='text-green-500 underline'>View</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="10" className="px-6 py-4 text-center text-gray-400">
                 {t('orderhistry.noSalesFound')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <div className='space-x-2'>
          <button 
            className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => {printAllInvoices(); playClickSound();}}>
            {t('orderhistry.printAll')}
          </button>
          <button 
            className="bg-gray-700 hover:bg-green-600 text-white px-4 py-2 rounded"
            onClick={()=>{navigate(`/menu`); playClickSound();}}>
             {t('orderhistry.back')}
          </button>
        </div>
        <h1> {t('home.total')} <span className="text-green-400">₹{totalAmount.toFixed(2)}</span></h1>
      </div>

      {/* Custom Date Modal */}
      {customDateModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-70 z-50">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 w-96 space-y-4">
            <h2 className="text-lg font-bold text-white">Select Custom Date Range</h2>
            <div className="space-y-2">
              <label className="block text-sm text-gray-300">Start Date</label>
              <input
                type="date"
                className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded"
                value={startDate}
                onChange={(e) => {setStartDate(e.target.value); playClickSound();}}
              />
              <label className="block text-sm text-gray-300">End Date</label>
              <input
                type="date"
                className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded"
                value={endDate}
                onChange={(e) => {setEndDate(e.target.value); playClickSound();}}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="bg-gray-700 px-4 py-2 rounded" onClick={() => setCustomDateModal(false)}>Cancel</button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded"
                onClick={() => {
                  setFilter('custom');
                  setCustomDateModal(false);
                  playClickSound();
                }}
              >
                 {t('orderhistry.apply')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Item Modal (Optional UI - You can implement it if needed) */}
      {openItems && (
        <div className='absolute p-3 inset-0 flex justify-center items-center h-screen bg-opacity-70 bg-gray-950 z-50'>
        <div className='bg-gray-900 border border-gray-700 md:p-6 w-full md:w-1/3 rounded-lg'>
          <div className="p-2 rounded-lg shadow-lg">
            <div className="flex justify-between items-center bg-gray-900 py-3 border-b-2 border-gray-500">
              <h1 className="text-white font-semibold">{tableData[openItems.tableId] ? tableData[openItems.tableId] : ``}
              </h1>
                <p className="text-gray-400 text-sm">
                  {moment(openItems.date).format('DD/MM/YYYY hh:mm A')}
                </p>
            </div>
            <div className="overflow-auto border border-gray-700 max-h-72">
              <table className="w-full text-sm text-white">
                <thead className="bg-gray-800 sticky top-0 z-10">
                  <tr className="flex justify-between px-3 py-2 border-b-2 border-gray-700">
                    <th className="flex-1 text-left"> {t('orderhistry.items')}</th>
                    <th className="flex-1 text-left"> {t('orderhistry.size')}</th>
                    <th className="flex-1 text-center"> {t('orderhistry.qty')}</th>
                    <th className="flex-1 text-center"> {t('orderhistry.rate')}</th>
                    <th className="flex-1 text-right"> {t('orderhistry.price')}</th>
                  </tr>
                </thead>
                <tbody className="block h-60 overflow-y-auto">
                  {openItems.items.map((item, idx) => (
                    <tr key={idx} className="flex justify-between px-3 py-2 border-b border-gray-800">
                      <td className="flex-1 text-left">{item.name}</td>
                      <td className="flex-1 text-left">{item.size}</td>
                      <td className="flex-1 text-center">{item.quantity}</td>
                      <td className="flex-1 text-center">{item.price}</td>
                      <td className="flex-1 text-right">{(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                 <div>
                 </div>
                </tbody>
              </table>
            </div>
            {/* <div className='p-y-3 border-x p-2 border-gray-700 text-sm'>
              <div className='flex justify-between items-center '>
                <label htmlFor="">Sub Total</label>
                <h1>{(openItems.SubtotalAmmount).toFixed(2)}</h1>
              </div>
              <div className='flex justify-between items-center '>
                <label htmlFor="">VAT({openItems.vatPercentage}%)</label>
                <h1>{(openItems.vatAmount).toFixed(2)}</h1>
              </div>
              <div className='flex justify-between items-center '>
                <label htmlFor="">Discount({openItems.Discount}%)</label>
                <h1>{-(openItems.DiscountAmmount).toFixed(2)}</h1>
              </div>
              <div className='flex justify-between items-center '>
                <label htmlFor="">Total Amount</label>
                <h1>{(openItems.totalAmmount).toFixed(2)}</h1>
              </div>
            </div> */}
            <div className="flex justify-between items-center  gap-2 pt-2">
              <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-md transition-all" onClick={() => {setOpenItems(null); playClickSound();}}>
                 {t('orderhistry.close')}
              </button>
              <button 
                onClick={() => {printInvoice(openItems); playClickSound();}}
                className="w-full bg-blue-700 hover:bg-blue-600 text-white py-2 rounded-md transition-all"
              >
                 {t('orderhistry.printInvoice')}
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
