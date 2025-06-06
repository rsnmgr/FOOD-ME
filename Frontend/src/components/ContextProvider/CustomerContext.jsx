import { createContext, useState, useEffect } from "react";
import axios from "axios";

// Create the CustomerContext
export const CustomerContext = createContext();

export function CustomerContextProvider({ children }) {
  const [customerData, setCustomerData] = useState(""); // State for customer data
  const API_URL = import.meta.env.VITE_API_URL;
  const [tableData, setTableData] = useState(null);
  const AdminId = customerData?.validUser?.adminId;
  const tableId = customerData?.validUser?.tableId;
  const Cname = customerData?.validUser?.name;
  const Cphone = customerData?.validUser?.phone;
  const CustomerId = customerData?.validUser?._id;
  const [userData, setUserData] = useState(null);  
  const [ipAddress, setIpAddress] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tables/${AdminId}/${tableId}`);
        setTableData(response.data); // Update the state with fetched data
      } catch (error) {
        // console.error("Error fetching table data:", error);
      }
    };
    const fetchUserData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/fetch/${AdminId}`);
        if (res.ok) {
          const data = await res.json();
          setUserData(data.customer);
        }
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    if (AdminId && tableId) {
      fetchData(); // Fetch data only if parameters are available
      fetchUserData();
      
    }
  }, [AdminId, tableId]);

  // Fetch server IP once on component mount
  useEffect(() => {
    const fetchServerIP = async () => {
      try {
        const res = await fetch(`${API_URL}/api/server-ip`);
        if (!res.ok) throw new Error('Failed to fetch server IP');
        const data = await res.json();
        setIpAddress(data.localIP || '');
      } catch (err) {
        console.error('Error fetching server IP:', err);
        setIpAddress('Unable to fetch IP');
      }
    };

    fetchServerIP();
  }, [API_URL]);
  
  return (
    <CustomerContext.Provider value={{ customerData,CustomerId,userData, setCustomerData ,tableData,AdminId,ipAddress, tableId,Cname,Cphone}}>
      {children}
    </CustomerContext.Provider>
  );
}
