import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { LoginContext } from "../../../ContextProvider/Context";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL;

export default function ProfitLossAnalysis() {
  const { t, i18n } = useTranslation();
  const { loginData } = useContext(LoginContext);
  const userId = loginData?.validUser?.role === 'admin'
    ? loginData?.validUser?._id
    : loginData?.validUser?.AdminId;

  const [filter, setFilter] = useState('lastWeek');
  const [chartData, setChartData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);

  const fetchData = async () => {
    try {
      if (!userId) return;

      const [salesRes, purchaseRes] = await Promise.all([
        fetch(`${API_URL}/api/fetch-report/${userId}`),
        fetch(`${API_URL}/api/purchases/${userId}`)
      ]);
      const [salesJson, purchaseJson] = await Promise.all([
        salesRes.json(),
        purchaseRes.json()
      ]);
      setSalesData(salesJson.sales || []);
      setPurchaseData(purchaseJson.purchases || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const prepareChartData = () => {
    const now = new Date();
    let periods = [];

    switch (filter) {
      case 'lastWeek':
        const weekdaysShort = t('days_short', { returnObjects: true });
        periods = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now);
          date.setDate(date.getDate() - 6 + i);
          return {
            label: weekdaysShort[date.getDay()],
            start: new Date(date.setHours(0, 0, 0, 0)),
            end: new Date(date.setHours(23, 59, 59, 999))
          };
        });
        break;

      case 'lastYear':
        const monthsShort = t('months_short', { returnObjects: true });
        periods = Array.from({ length: 12 }, (_, i) => {
          let month = now.getMonth() - (11 - i);
          let year = now.getFullYear();
          if (month < 0) {
            month += 12;
            year -= 1;
          }

          return {
            label: monthsShort[month],
            start: new Date(year, month, 1),
            end: new Date(year, month + 1, 0, 23, 59, 59, 999)
          };
        });
        break;

      case 'last5Years':
        periods = Array.from({ length: 5 }, (_, i) => {
          const year = now.getFullYear() - 4 + i;
          return {
            label: year.toString(),
            start: new Date(year, 0, 1),
            end: new Date(year, 11, 31, 23, 59, 59, 999)
          };
        });
        break;
    }

    const processedData = periods.map(period => {
      const sales = salesData
        .filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= period.start && itemDate <= period.end;
        })
        .reduce((acc, item) => acc + (item.totalAmmount || 0), 0);

      const purchase = purchaseData
        .filter(item => {
          const itemDate = new Date(item.dateOfPurchase);
          return itemDate >= period.start && itemDate <= period.end;
        })
        .reduce((acc, item) => acc + (item.totalPrice || 0), 0);

      return {
        label: period.label,
        sales: sales || 0,
        purchase: purchase || 0,
        profit: Math.abs(sales - purchase),
        isLoss: sales < purchase
      };
    });

    setChartData(processedData);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const purchase = payload.find(p => p.dataKey === 'purchase')?.value || 0;
      const sales = payload.find(p => p.dataKey === 'sales')?.value || 0;
      const profit = sales - purchase;

      return (
        <div className="bg-gray-700 p-3 rounded-lg shadow-lg text-sm">
          <strong>{label}</strong>
          <div className="mt-2">
            <p className="text-blue-400">{t('purchase')}: {purchase.toFixed(2)}</p>
            <p className="text-green-400">{t('sales')}: {sales.toFixed(2)}</p>
            <p className={`mt-1 ${profit >= 0 ? 'text-green-500' : 'text-red-400'}`}>
              {profit >= 0 ? t('profit') : t('loss')}: {Math.abs(profit).toFixed(2)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  useEffect(() => {
    if (salesData.length > 0 && purchaseData.length > 0) {
      prepareChartData();
    }
  }, [salesData, purchaseData, filter, i18n.language]);

  return (
    <div className="bg-gray-800 text-white rounded-lg p-4 sm:p-8 shadow-xl">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-lg sm:text-xl font-bold">{t('profit_analysis')}</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-700 text-white px-3 py-1 rounded-md text-sm outline-none"
        >
          <option value="lastWeek">{t('last_week')}</option>
          <option value="lastYear">{t('last_year')}</option>
          <option value="last5Years">{t('last_5_years')}</option>
        </select>
      </div>
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 15, right: 0, left: 0, bottom: 5 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis
              dataKey="label"
              stroke="#CBD5E0"
              tick={{ fill: '#CBD5E0', fontSize: 12 }}
              axisLine={{ stroke: '#4A5568' }}
            />
            <YAxis
              stroke="#CBD5E0"
              tick={{ fill: '#CBD5E0', fontSize: 12 }}
              axisLine={{ stroke: '#4A5568' }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "#374151", opacity: 0.5 }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            <Bar dataKey="purchase" fill="#3b82f6" name={t('purchase')} radius={[2, 2, 0, 0]} barSize={20} />
            <Bar dataKey="sales" fill="#10b981" name={t('sales')} radius={[2, 2, 0, 0]} barSize={20} />
            <Bar
              dataKey="profit"
              name={t('net_profit')}
              fill="#166534" 
              barSize={20}
              radius={[2, 2, 0, 0]}
              shape={({ x, y, width, height, payload }) => {
                const color = payload.isLoss ? '#ef4444' : '#064e3b';
                return (
                  <rect x={x} y={y} width={width} height={height} fill={color} rx={2} ry={2} />
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
