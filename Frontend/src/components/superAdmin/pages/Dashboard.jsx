import { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [totalMessages, setTotalMessages] = useState(0);
  const [totalAdmins,setTotalAdmins]= useState(0);

  const fetchMessageCount = async () => {
    try {
      const response = await fetch(`${API_URL}/api/message`);
      const data = await response.json();
      if (data.success) {
        setTotalMessages(data.messages.length);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const fetchAdminCount = async () => {
    try {
      const response = await fetch(`${API_URL}/api/fetchAll`);
      const data = await response.json();
     
        setTotalAdmins(data.customers.length);
   
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  useEffect(() => {
    fetchMessageCount();
    fetchAdminCount();
  }, []);

  return (
    <div className="grid md:grid-cols-4 gap-4">
      <div className="text-center bg-gray-800 p-6 rounded-md">
        <h1>Total Message</h1>
        <label htmlFor="">{totalMessages}</label>
      </div>
      <div className="text-center bg-gray-800 p-6 rounded-md">
        <h1>Total Restaurant Owner</h1>
        <label htmlFor="">{totalAdmins}</label>
      </div>
    </div>
  );
}
