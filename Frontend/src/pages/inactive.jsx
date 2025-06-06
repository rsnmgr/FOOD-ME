import { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../components/ContextProvider/Context';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function Inactive() {
  const navigate = useNavigate();
  const { setLoginData } = useContext(LoginContext);
  const [inactiveInfo, setInactiveInfo] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get inactive account information or check token validity
  useEffect(() => {
    const checkInactiveStatus = async () => {
      try {
        // First, check if we have inactive account info from login
        const inactiveAccountInfo = sessionStorage.getItem("inactiveAccountInfo");
        
        if (inactiveAccountInfo) {
          try {
            const parsedInfo = JSON.parse(inactiveAccountInfo);
            setInactiveInfo(parsedInfo);
            // Clear this info after retrieving it
            sessionStorage.removeItem("inactiveAccountInfo");
            return;
          } catch (error) {
            console.error("Error parsing inactive account info:", error);
          }
        }
        
        // If no inactive info, check if there's a token
        const token = localStorage.getItem("TokenFoodMe");
        if (!token) {
          navigate('/login');
          return;
        }
        
        // Verify the token is for an inactive account
        // This ensures users can't directly navigate to the inactive page
        try {
          const res = await fetch(`${API_URL}/api/validUser`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: token,
            },
          });
          const data = await res.json();
          
          if (res.status === 200 && data.isInactive) {
            // This is a valid inactive user, let them stay on this page
            return;
          } else {
            // Either not a valid token or not an inactive user
            // Redirect them to login
            navigate('/login');
          }
        } catch (error) {
          console.error("Error validating inactive status:", error);
          navigate('/login');
        }
      } catch (error) {
        console.error("Error in inactive status check:", error);
        navigate('/login');
      }
    };
    
    checkInactiveStatus();
    
    // Clean up function
    return () => {
      // Any cleanup needed
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      // Only show one toast notification during logout
      toast.info("Logging out...", { autoClose: 3000 });
      
      const token = localStorage.getItem("TokenFoodMe");
      
      // Call the logout API
      const res = await fetch(`${API_URL}/api/logout`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      });
      
      // Clear the token regardless of response
      localStorage.removeItem("TokenFoodMe");
      
      // Clear the login data from context
      setLoginData(null);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      console.error("Logout error:", error);
      
      // Even if there's an error, still logout the user on the client side
      localStorage.removeItem("TokenFoodMe");
      setLoginData(null);
      toast.error("Error during logout, redirecting to login page", { autoClose: 3000 });
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4 py-20 sm:px-6 md:px-8 lg:px-10 bg-gray-950 text-white">
      <div className="max-w-lg w-full p-8 bg-gray-800 rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-yellow-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">
          Account Inactive
        </h1>
        <p className="text-lg mb-4 text-gray-300">
          {inactiveInfo?.message || "Your account is currently marked as inactive. Please contact your administrator for access."}
        </p>
        {inactiveInfo?.email && (
          <p className="text-md mb-6 text-gray-400">
            Email: <span className="font-semibold">{inactiveInfo.email}</span>
          </p>
        )}
        <button 
          onClick={handleLogout}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition duration-300 disabled:opacity-75"
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Logging out..." : "Return to Login"}
        </button>
      </div>
      
      {/* ToastContainer for notifications */}
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={3}
        theme="dark"
      />
    </main>
  );
}
