import  {  useEffect, useContext } from 'react';
import Header from '../components/Customer/Header';
import Main from '../components/Customer/Main';
import Bag from '../components/Customer/pages/Bag';
import Bill from '../components/Customer/pages/Bill';
import Histry from '../components/Customer/pages/Histry';
import MyProfile from '../components/Customer/pages/myProfile';
import PaymentSuccess from '../components/Customer/pages/paymentSuccess';
import PaymentFalure from '../components/Customer/pages/paymentFail';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { CustomerContext } from '../components/ContextProvider/CustomerContext';
export default function Menu() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const { setCustomerData } = useContext(CustomerContext);

  // Async function to validate the customer
  const customer = async () => {
    const token = localStorage.getItem("customerToken");
    if (!token) {
      // If there's no token, navigate to a different page or logout
      navigate("/error"); // Redirect to an error page or login page
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/valid-customer`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      });

      const data = await res.json();
      
      // If validation fails or the user is not a customer, redirect
      if (res.status === 401 || !data || data.validUser.role !== 'customer') {
        navigate("/error"); // Redirect to an error page or login page
      } else {
        setCustomerData(data); // Set the validated customer data
      }
    } catch (error) {
      console.error('Error during customer validation:', error);
      navigate("/error"); // If an error occurs, redirect to an error page or login page
    }
  };

  // Run the customer validation check when the component mounts
  useEffect(() => {
    customer();
  }, []); // Empty dependency array ensures it runs once when the component mounts

  return (
    <div className="h-screen flex flex-col">
      {/* Header Section */}
      <div className="border-b border-gray-800">
        <Header />
      </div>

      {/* Main Content Section */}
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/bag" element={<Bag />} />
          <Route path="/bill" element={<Bill />} />
          <Route path="/histry" element={<Histry />} />
          <Route path="/myProfile" element={<MyProfile />} />
          <Route path="/paymentSuccess" element={<PaymentSuccess />} />
          <Route path="/paymentFail" element={<PaymentFalure />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </div>
  );
}
