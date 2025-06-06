import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import img from '../assets/login.png';
import { FaUser, FaLock, FaEye, FaEyeSlash,FaGoogle } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inpval, setInpval] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const setVal = (e) => {
    setInpval({ ...inpval, [e.target.name]: e.target.value });
  };

  const checkValidUser = async () => {
    const token = localStorage.getItem("TokenFoodMe");
    if (!token) return;

    try {
      const { data } = await axios.get(`${API_URL}/api/validUser`, {
        headers: { Authorization: token }
      });

      if (!data?.validUser) return;

      if (data.isInactive) {
        navigate("/inactive");
        return;
      }

      const { role } = data.validUser;
      if (role === 'admin') navigate("/admin/dashboard");
      else if (role === 'super') navigate("/super");
      else if (role === 'staff') navigate("/admin");
      else navigate("*");

    } catch (error) {
      console.error("Error validating user:", error);
    }
  };

  const loginUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/login`, inpval, {
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' }
      });
      // Destructures the response to get HTTP status and data.
      const { status, data } = response;

      if (status === 201) {
        localStorage.setItem("TokenFoodMe", data.result.token);
        toast.success(data.message, { autoClose: 6000, icon: "✅" });

        const role = data.result.role;
        if (role === "admin" || role === "staff") navigate("/admin");
        else if (role === "super") navigate("/super");
        else navigate("*");

      } else {
        toast.error(data.message || "Login failed. Please try again.", {
          autoClose: 6000,
          icon: "❌"
        });
        setLoading(false);
      }

    } catch (error) {
      setLoading(false);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const { status, data } = error.response;

          if (status === 404) {
            toast.error("User not found. Please check your email address.", { icon: "🔍" });
          } else if (status === 401) {
            toast.error("Incorrect password. Please try again.", { icon: "🔒" });
          } else if (status === 403 && data?.isInactive) {
            toast.error(data.message, {
              autoClose: 10000,
              icon: "⚠️",
              closeOnClick: false
            });

            sessionStorage.setItem("inactiveAccountInfo", JSON.stringify({
              message: data.message,
              email: inpval.email,
              timestamp: new Date().toISOString()
            }));

            setTimeout(() => {
              navigate('/inactive');
            }, 8000);
          } else {
            toast.error(data.message || "Login failed. Please try again.", { icon: "❌" });
          }

        } else if (error.code === "ECONNABORTED") {
          toast.error("Login request timed out. Please check your connection and try again.", { icon: "⏱️" });
        } else {
          toast.error("Network error. Please check your internet connection.", { icon: "📶" });
        }
      } else {
        toast.error("An error occurred during login. Please try again later.", { icon: "⚠️" });
      }
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const handleRegisterRedirect = () => navigate('/register');

  useEffect(() => {
    checkValidUser();
  }, []);

  return (
    <div className='flex justify-center items-center min-h-screen'>
      <div className='grid grid-cols-1 md:grid-cols-2 bg-gray-900 rounded-lg shadow-lg w-full max-w-4xl mx-4 border border-gray-700'>
        
        {/* Image Section */}
        <div className='relative hidden md:flex justify-center items-center'>
          <img src={img} alt="Login Illustration" className='h-[80vh] object-cover rounded-l-lg' />
          <h2 className='absolute top-36 right-16 text-orange-500 font-extrabold text-xl'>FOOD ME</h2>
        </div>

        {/* Form Section */}
        <div className='flex flex-col justify-center items-center p-6 bg-gray-800 text-white rounded-r-lg shadow-lg'>
          <h2 className='text-3xl font-bold mb-6'>Login</h2>
          
          <form className='flex flex-col gap-4 w-full max-w-xs' onSubmit={loginUser}>
            <div className='flex items-center border border-gray-500 p-3 rounded-md bg-gray-700'>
              <FaUser className='text-gray-400 mr-3' />
              <input
                type='text'
                placeholder='Email'
                name='email'
                value={inpval.email}
                onChange={setVal}
                className='outline-none w-full bg-transparent text-white'
                required
              />
            </div>

            <div className='flex items-center border border-gray-500 p-3 rounded-md bg-gray-700'>
              <FaLock className='text-gray-400 mr-3' />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder='Password'
                name='password'
                value={inpval.password}
                onChange={setVal}
                className='outline-none w-full bg-transparent text-white'
                required
              />
              <button type='button' onClick={togglePasswordVisibility} className='ml-3'>
                {showPassword ? <FaEye className='text-gray-400' /> : <FaEyeSlash className='text-gray-400' />}
              </button>
            </div>

            <button 
              type='submit'
              className='bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 w-full flex justify-center items-center'
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <p onClick={() => navigate("/forgot-password")} className='text-gray-400 text-center cursor-pointer hover:text-blue-400'>
              Forgot Password?
            </p>
          </form>

          <div className='flex items-center my-4 w-full max-w-xs'>
            <hr className='flex-grow border-gray-500' />
            <span className='mx-2 text-gray-400'>or</span>
            <hr className='flex-grow border-gray-500' />
          </div>
          {/* Social Login */}
          {/* <div className='flex flex-col gap-3 w-full max-w-xs'>
            <button className='flex items-center justify-center gap-3 bg-red-500 text-white p-3 rounded-md hover:bg-red-600 w-full'>
              <FaGoogle />
              Login with Google
            </button>
          </div> */}

          <p className='mt-4 text-gray-400'>
            Don't have an account?{' '}
            <span 
              onClick={handleRegisterRedirect} 
              className='text-orange-500 cursor-pointer hover:underline'
            >
              Register
            </span>
          </p>
        </div>
      </div>

      <ToastContainer 
        position="bottom-right"
        autoClose={6000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={4}
        theme="dark"
      />
    </div>
  );
}
