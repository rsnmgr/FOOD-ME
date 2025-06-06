import { useState, useEffect, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import Card from "./dasbhoard/card";
import Chart from "./dasbhoard/chart";
import Table from "./dasbhoard/table";
import Visitor from './dasbhoard/profitLossAnalysis';
import { LoginContext } from "../../ContextProvider/Context";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Dashboard({ userRole, userCategory }) {
  const { t } = useTranslation();
  const { loginData } = useContext(LoginContext);
  const [userData, setUserData] = useState(null);

  const id = loginData?.validUser?._id;
  const routePath = userRole === "admin" ? "fetch" : "details";
  const userId = userRole === "admin" ? id : loginData?.validUser?.AdminId;

  const today = useMemo(() => 
    new Date().toLocaleDateString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    []
  );

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/${routePath}/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        const relevantData = userRole === 'admin' ? data.customer : data.details.find(user => user._id === id);
        setUserData(relevantData);
      } catch (error) {
        console.error("Fetch user data failed", error);
      }
    };

    fetchUserData();
  }, [userId, userRole, id, routePath]);

  const isStaff = userRole === 'staff';

  const roleLabel = userRole === 'admin'
    ? t('admin')
    : isStaff
      ? (userCategory === 'waiter' ? t('waiter') : t('kitchen'))
      : t('guest');

  return (
    <div className="overflow-x-auto h-[95vh] space-y-4 p-3">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-md bg-gray-800 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {t('welcome', { name: userData?.name })}
          </h1>
          <p className="text-lg text-gray-300">{t('store_summary')}</p>
        </div>
        <div className="text-lg md:text-right text-white">
          <h1>{today}</h1>
          <p>{t('role')}: <span>{roleLabel}</span></p>
        </div>
      </div>

      {/* KPI Cards */}
      <Card userRole={userRole} />

      {/* Chart and Visitor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        <div className="w-full">
          <Chart userRole={userRole} />
        </div>
        <div className="w-full">
          <Visitor />
        </div>
      </div>

      {/* Sales/Purchase Table */}
      <Table userRole={userRole} />
    </div>
  );
}
