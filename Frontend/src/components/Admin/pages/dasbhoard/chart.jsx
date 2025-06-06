import { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
const API_URL = import.meta.env.VITE_API_URL;
import { LoginContext } from "../../../ContextProvider/Context";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

export default function Chart({ userRole }) {
  const [filter, setFilter] = useState('Day');
  const [chartData, setChartData] = useState([]);
  const { t,i18n } = useTranslation();

  const { loginData } = useContext(LoginContext);
  const userId = userRole === 'admin' ? loginData?.validUser?._id : loginData?.validUser?.AdminId;

  const [salesData, setSalesData] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalPurchase, setTotalPurchase] = useState(0);

  const fetchSalesData = async () => {
    try {
      if (!userId) {
        console.log("Skipping sales data fetch - invalid userId");
        return;
      }
      const res = await fetch(`${API_URL}/api/fetch-report/${userId}`);
      const json = await res.json();
      setSalesData(json.sales || []);
    } catch (err) {
      console.error("Error fetching sales data", err);
    }
  };

  const fetchPurchaseData = async () => {
    try {
      if (!userId) {
        console.log("Skipping purchase data fetch - invalid userId");
        return;
      }
      const res = await fetch(`${API_URL}/api/purchases/${userId}`);
      const json = await res.json();
      setPurchaseData(json.purchases || []);
    } catch (err) {
      console.error("Error fetching purchase data", err);
    }
  };

  const getStartDate = (filterType, dataType) => {
    const now = new Date();
    let startDate;

    switch (filterType) {
      case 'Day':
        startDate = new Date();
        if (dataType === 'sales') {
          startDate.setDate(now.getDate() - 6);
        } else if (dataType === 'purchase') {
          startDate.setDate(now.getDate() - 7);
        }
        break;

      case 'Month':
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 12);
        break;

      case 'Year':
        startDate = new Date();
        startDate.setFullYear(now.getFullYear() - 6);
        break;

      default:
        startDate = new Date('2023-01-01');
    }

    return startDate;
  };

  const processData = (filterType) => {
    const dataMap = new Map();
    const now = new Date();
    const startDateSales = getStartDate(filterType, 'sales');
    const startDatePurchase = getStartDate(filterType, 'purchase');

    // Get localized days and months arrays from i18next translations
    const weekdays = t('days_short', { returnObjects: true });
    const months = t('months_short', { returnObjects: true });

    const process = (arr, type, startDate) => {
      arr.forEach(item => {
        const date = new Date(item.date || item.dateOfPurchase);
        if (date >= startDate) {
          let groupKey = '';
          if (filterType === 'Day') {
            groupKey = weekdays[date.getDay()];
          } else if (filterType === 'Month') {
            groupKey = months[date.getMonth()];
          } else if (filterType === 'Year') {
            groupKey = date.getFullYear().toString();
          }

          const existing = dataMap.get(groupKey) || { name: groupKey, sales: 0, purchase: 0 };
          existing[type] += item.totalAmmount || item.totalPrice || 0;
          dataMap.set(groupKey, existing);
        }
      });
    };

    process(salesData, 'sales', startDateSales);
    process(purchaseData, 'purchase', startDatePurchase);

    const filledData = [];

    if (filterType === 'Day') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const name = weekdays[d.getDay()];
        filledData.push(dataMap.get(name) || { name, sales: 0, purchase: 0 });
      }
    } else if (filterType === 'Month') {
      const currentMonth = now.getMonth();
      for (let i = 11; i >= 0; i--) {
        const index = (currentMonth - i + 12) % 12;
        const name = months[index];
        filledData.push(dataMap.get(name) || { name, sales: 0, purchase: 0 });
      }
    } else if (filterType === 'Year') {
      const currentYear = now.getFullYear();
      for (let i = 5; i >= 0; i--) {
        const year = (currentYear - i).toString();
        filledData.push(dataMap.get(year) || { name: year, sales: 0, purchase: 0 });
      }
    }

    setChartData(filledData);

    let totalSales = 0;
    let totalPurchase = 0;
    filledData.forEach(item => {
      totalSales += item.sales;
      totalPurchase += item.purchase;
    });
    setTotalSales(totalSales);
    setTotalPurchase(totalPurchase);
  };

  useEffect(() => {
    if (userId) {
      fetchSalesData();
      fetchPurchaseData();
    }
  }, [userId]);

  useEffect(() => {
  if (salesData.length || purchaseData.length) {
    processData(filter);
  }
}, [filter, salesData, purchaseData, i18n.language]);


  return (
    <div className="w-full bg-gray-800 text-white py-4 px-2 sm:px-4 rounded-lg shadow-lg">
      <div className="flex flex-wrap justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <p className="text-base sm:text-lg font-semibold text-blue-400">{t('title')}</p>
          <p className="text-sm text-gray-400">{t('subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['day', 'month', 'year'].map(label => (
            <button
              key={label}
              onClick={() => setFilter(label.charAt(0).toUpperCase() + label.slice(1))}
              className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition ${
                filter.toLowerCase() === label ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {t(label)}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="colorpurchase" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            contentStyle={{ backgroundColor: '#374151', borderRadius: '0.5rem', color: '#f9fafb', border: 'none', padding: '10px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)' }}
            labelStyle={{ color: '#d1d5db', fontWeight: 'bold' }}
            itemStyle={{ color: '#e5e7eb' }}
            cursor={{ stroke: "#4B5563", strokeWidth: 2 }}
          />
          <Legend />
          <Area type="monotone" dataKey="purchase" stroke="#3b82f6" fillOpacity={1} fill="url(#colorpurchase)" />
          <Area type="monotone" dataKey="sales" stroke="#34d399" fillOpacity={1} fill="url(#colorSales)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
