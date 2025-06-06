import { useEffect, useState, useContext } from 'react';
import { LuSearch } from 'react-icons/lu';
import { MdDelete } from 'react-icons/md';
import { LuView } from "react-icons/lu";
import { LoginContext } from '../../../ContextProvider/Context';
import { io } from "socket.io-client";
import moment from "moment";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);
import { useTranslation } from 'react-i18next';

export default function Sales() {
  const [openItems, setOpenItems] = useState(null);
  const { loginData } = useContext(LoginContext);
  const userId = loginData?.validUser?._id;
  const [sales, setSales] = useState([]);
  const [tableData, setTableData] = useState({});
  const [deleteReport, setDeleteReport] = useState();
  const [customdate, setCustomDate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { t } = useTranslation();

  // Open custom date form when filter is set to "custom"
  useEffect(() => {
    if (filter === 'custom') {
      setCustomDate(true);
    }
  }, [filter]);

  useEffect(() => {
    if (!userId) return;

    const fetchReport = async () => {
      try {
        const response = await fetch(`${API_URL}/api/fetch-report/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch report");
        }
        const data = await response.json();
        
        if (data && Array.isArray(data.sales)) {
          setSales(data.sales);
          data.sales.forEach(sale => {
            const { tableId } = sale;
            fetchTableName(tableId);
          });
        } else {
          console.error("Fetched data is not in the expected format:", data);
        }
      } catch (error) {
        console.error("Error fetching report:", error);
      }
    };

    const fetchTableName = async (tableId) => {
      if (tableData[tableId]) return; // If the table data is already available, don't refetch
      try {
        const response = await fetch(`${API_URL}/api/tables/${userId}/${tableId}`);
        if (response.ok) {
          const table = await response.json();
          setTableData(prev => ({ ...prev, [tableId]: table.table.name }));
        }
      } catch (error) {
        console.error("Error fetching table data:", error);
      }
    };

    fetchReport();
    socket.on("reportAdded", fetchReport);
    socket.on("saleDeleted", fetchReport);
    return () => {
      socket.off("reportAdded", fetchReport);
      socket.off("saleDeleted", fetchReport);
    };
  }, [userId, tableData]);

  const deleteSales = async (saleId) => {
    if (!userId || !saleId) return;
    
    try {
      const response = await fetch(`${API_URL}/api/sales/delete/${userId}/${saleId}`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete sale");
      }
  
      // Remove the deleted sale from the state
      setSales(prevSales => prevSales.filter(sale => sale._id !== saleId));
      setDeleteReport(false); // Close delete confirmation modal
      toast.success(t("report_deleted_successfully"));
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast.error(t("report_delete_failed")); 
    }
  };

  const getFilteredSales = (sales, filter) => {
    const now = moment();
    switch (filter) {
      case 'days':
        return sales.filter(sale => moment(sale.date).isSame(now, 'day'));
      case 'weekly':
        return sales.filter(sale => 
          moment(sale.date).isSameOrAfter(now.clone().subtract(7, 'days'), 'day')
        );
      case 'monthly':
        return sales.filter(sale => 
          moment(sale.date).isSameOrAfter(now.clone().subtract(30, 'days'), 'day')
        );
      case 'custom':
        return sales.filter(sale => 
          moment(sale.date).isBetween(moment(startDate), moment(endDate), null, '[]')
        );
      default:
        return sales;
    }
  };
  

  const filteredSales = getFilteredSales(sales, filter).filter(sale => 
    tableData[sale.tableId]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = filteredSales.reduce((total, sale) => total + sale.totalAmmount, 0);

  const handleCustomFilter = () => {
    setFilter('custom');
    setCustomDate(false);
  };

  return (
    <div className='flex flex-col h-full p-3'>
      <div className='flex justify-between items-center mb-4'>
        <div className="relative w-full max-w-xs">
          <LuSearch className="absolute inset-y-0 left-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none text-gray-500 w-5 h-5" />
          <input
            type="text"
            className="block w-[70%] p-3 pl-10 text-slate-200 bg-gray-900 text-sm border border-gray-800 outline-none rounded-lg"
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select 
            name="filter" 
            id="filter" 
            className='p-2 px-3 bg-black border border-gray-800 outline-none'
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">{t('all')}</option>
            <option value="days">{t('day')}</option>
            <option value="weekly">{t('last_week')}</option>
            <option value="monthly">{t('month')}</option>
            <option value="custom">{t('custom')}</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-md">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-800 sticky top-0 z-10">
            <tr>
              {[
                { short: 'sn', full: 'Serial Number' },
                { short: 'table_name', full: 'Table Name' },
                { short: 'items', full: 'Item Name' },
                { short: 'subTotal', full: 'Sub Total' },
                { short: 'discount', full: 'Discount %' },
                { short: 'discountAmount', full: 'Discount Amount' },
                { short: 'totalAmount', full: 'Total Amount' },
                { short: 'paymentType', full: 'Payment Type' },
                { short: 'date', full: 'Date' },
                { short: 'action', full: 'Actions' }
              ].map(({ short, full }) => (
                <th
                  key={short}
                  className="px-6 py-3 text-center text-sm font-medium uppercase tracking-wider text-gray-100"
                  title={full}
                >
                  {t(short)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {filteredSales.length ? filteredSales.map((sale, index) => (   
              <tr key={index} className="text-slate-200">
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{index + 1}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{tableData[sale.tableId] || "Loading..."}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                  {sale.items.reduce((total, item) => total + item.quantity, 0)}
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{sale.SubtotalAmmount}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{sale.Discount}%</td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{sale.DiscountAmmount}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{sale.totalAmmount}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{sale.paymentType}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm"><span>{moment(sale.date).format("YYYY-MM-DD")}</span> <span className='block'>{moment(sale.date).format("hh:mm A")}</span></td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm flex justify-center gap-2">
                  <LuView
                    className="text-2xl text-green-800 cursor-pointer"
                    title='view'
                    onClick={() => setOpenItems(sale)}
                  />
                  <MdDelete
                    title="Delete"
                    className="text-2xl text-red-800 cursor-pointer"
                    onClick={() => setDeleteReport(sale._id)} 
                  />
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="10" className="px-6 py-4 text-center text-gray-400">No sales reports found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal to View Sale Items */}
      {openItems && (
        <div className='absolute p-3 inset-0 flex justify-center items-center h-screen bg-opacity-70 bg-gray-950 z-50'>
          <div className='bg-gray-900 border border-gray-700 md:p-6 w-full md:w-1/3 rounded-lg'>
            <div className="0 p-2  rounded-lg shadow-lg">
              <div className="flex justify-between items-center bg-gray-900 p-3 border-b-2 border-gray-500">
                <h1 className="text-white font-semibold">            {tableData[openItems.tableId] ? tableData[openItems.tableId] : ``}
                </h1>
                <p className="text-gray-400 text-sm">{new Date(openItems.date).toLocaleTimeString()}</p>
              </div>
              <div className="overflow-auto max-h-72">
                <table className="w-full text-sm text-white">
                  <thead className="bg-gray-800 sticky top-0 z-10">
                    <tr className="flex justify-between px-3 py-2 border-b-2 border-gray-700">
                      <th className="flex-1 text-left">{t('items')}</th>
                      <th className="flex-1 text-center">{t('qty')}</th>
                      <th className="flex-1 text-right">{t('size')}</th>
                    </tr>
                  </thead>
                  <tbody className="block h-60 overflow-y-auto">
                    {openItems.items.map((item, idx) => (
                      <tr key={idx} className="flex justify-between px-3 py-2 border-b border-gray-800">
                        <td className="flex-1 text-left">{item.name}</td>
                        <td className="flex-1 text-center">{item.quantity}</td>
                        <td className="flex-1 text-right">{item.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center  gap-2 border-t border-gray-500 p-2">
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-md transition-all" onClick={() => setOpenItems(null)}>
                  {t('close')}
                </button>
                {/* <button className="w-full bg-green-800 hover:bg-green-700 text-white py-2 rounded-md transition-all">
                  Print
                </button> */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteReport && (
        <div className="absolute p-3 inset-0 flex justify-center items-center h-screen bg-opacity-70 bg-gray-950 z-50">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold">{t('confirmDeletion')}</h2>
            <p className="text-gray-400">{t('confirmDeleteReport')}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="bg-gray-800 px-4 py-2 rounded-md" onClick={() => setDeleteReport(null)}>{t('no')}</button>
              <button className="px-4 py-2 rounded-md bg-red-800 text-white" onClick={() => deleteSales(deleteReport)}>{t('yes')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Date Choose */}
      {customdate && (
        <div className="absolute p-3 inset-0 flex justify-center items-center h-screen bg-opacity-70 bg-gray-950 z-50">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold">{t('confirmFilter')}</h2>
            <div className='flex items-center space-x-2'>
              <div className='space-y-2'>
                <label htmlFor="">{t('startDate')}</label>
                <input 
                  type="date" 
                  className='block bg-gray-900 outline-none border border-gray-800 p-2' 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <label htmlFor="">{t('endDate')}</label>
                <input 
                  type="date" 
                  className='block bg-gray-900 outline-none border border-gray-800 p-2' 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="bg-gray-800 px-4 py-2 rounded-md" onClick={() => setCustomDate(false)}>{t('cancel')}</button>
              <button className="px-4 py-2 rounded-md bg-red-800 text-white" onClick={handleCustomFilter}>{t('applyFilter')}</button>
            </div>
          </div>
        </div>
      )}

      <div className='flex justify-between items-center pt-2'>
        <h1>{t('totalSalesAmount')}</h1>
        <span>{totalAmount.toFixed(2)}</span>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}