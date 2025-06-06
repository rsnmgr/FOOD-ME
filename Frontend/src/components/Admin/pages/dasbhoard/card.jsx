import { useContext, useEffect, useState } from 'react';
import { LuUsers } from "react-icons/lu";
import axios from 'axios';
import { LoginContext } from "../../../ContextProvider/Context";
import { MdTableBar, MdOutlineProductionQuantityLimits } from "react-icons/md";
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;

export default function Card({ userRole }) {
  const { loginData } = useContext(LoginContext);
  const { t } = useTranslation();

  const userId = userRole === "admin"
    ? loginData?.validUser?._id
    : loginData?.validUser?.AdminId;

  const [staffs, setStaffs] = useState([]);
  const [customer, setCustomer] = useState([]);
  const [totalProduct, setTotalProduct] = useState(0);
  const [counttotalTable, setTotalTable] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const fetchStaff = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/details/${userId}`);
        setStaffs(response.data.details);
      } catch (error) {
        console.error("Error fetching staff details:", error);
      }
    };

    const fetchCustomer = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/get-customer/${userId}`);
        setCustomer(response.data);
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    };

    const fetchTotalProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products/${userId}`);
        const data = await response.json();
        setTotalProduct(data.products.length);
      } catch (error) {
        console.error("Error fetching total product:", error);
      }
    };

    const totalTable = async () => {
      try {
        const response = await fetch(`${API_URL}/api/tables/${userId}`);
        const data = await response.json();
        setTotalTable(data.tables.length);
      } catch (error) {
        console.error("Error fetching total tables:", error);
      }
    };

    fetchStaff();
    fetchCustomer();
    fetchTotalProduct();
    totalTable();
  }, [userId]);

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 text-xl font-bold'>
      <div className='bg-gray-800 p-6 rounded-md'>
        <div className='flex justify-between items-center mb-2'>
          <label>{t('total_table')}</label>
          <span className='text-lg'><MdTableBar /></span>
        </div>
        <span>{counttotalTable}</span>
      </div>
      <div className='bg-gray-800 p-6 rounded-md'>
        <div className='flex justify-between items-center mb-2'>
          <label>{t('total_products')}</label>
          <span className='text-lg'><MdOutlineProductionQuantityLimits /></span>
        </div>
        <span>{totalProduct}</span>
      </div>
      <div className='bg-gray-800 p-6 rounded-md'>
        <div className='flex justify-between items-center mb-2'>
          <label>{t('total_staff')}</label>
          <span className='text-lg'><LuUsers /></span>
        </div>
        <span>{staffs.length}</span>
      </div>
      <div className='bg-gray-800 p-6 rounded-md'>
        <div className='flex justify-between items-center mb-2'>
          <label>{t('total_customer')}</label>
          <span className='text-lg'><LuUsers /></span>
        </div>
        <span>{customer.length}</span>
      </div>
    </div>
  );
}
