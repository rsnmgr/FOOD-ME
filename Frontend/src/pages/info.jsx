import { useState, useEffect ,useContext} from 'react';
import { IoIosArrowForward } from "react-icons/io";
import { useParams, useNavigate } from "react-router-dom";
import { CustomerContext } from '../components/ContextProvider/CustomerContext';
import { useTranslation } from 'react-i18next';

export default function Info() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { AdminId, tableId } = useParams();
  const { ipAddress } = useContext(CustomerContext);
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const { t,i18n } = useTranslation('customer');
    const [selectedLang, setSelectedLang] = useState(localStorage.getItem('i18nextLng') || 'en');
    const handleLanguageChange = (lang) => {
      i18n.changeLanguage(lang);
      localStorage.setItem('i18nextLng', lang);
      setSelectedLang(lang);
    };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please fill in both fields!');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/add-customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          adminId: AdminId,
          tableId: tableId,
          ipAddress: ipAddress
        })
      });

      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem('customerToken', data.token);
        alert(data.message);
        navigate('/menu');
      } else {
        alert(data.message || 'Failed to add customer.');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleSkip = async () => {
    try {
      const response = await fetch(`${API_URL}/api/add-customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "Guest",
          phone: `guest-${Date.now()}`,
          adminId: AdminId,
          tableId: tableId,
          ipAddress: ipAddress
        })
      });

      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem('customerToken', data.token);
        navigate('/menu');
      } else {
        alert(data.message || 'Failed to add customer.');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const customer = async () => {
    const token = localStorage.getItem("customerToken");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/valid-customer`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      });

      const data = await res.json();
      if (res.status === 200 && data?.validUser?.role === 'customer') {
        navigate("/menu");
      }
    } catch (error) {
      console.error('Error during customer validation:', error);
    }
  };

  const fetchCustomer = async () => {
    try {
      const res = await fetch(`${API_URL}/api/fetch/${AdminId}`);
      const data = await res.json();
      setData(data.customer);
    } catch (error) {
      console.error("Failed to fetch restaurant data");
    }
  };

  useEffect(() => {
    customer();
    fetchCustomer();
  }, [AdminId]);

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-gray-950 text-white px-4">
      <form onSubmit={handleSubmit} className="relative w-full max-w-md bg-gray-900 border border-gray-700 p-6 rounded-xl shadow-lg space-y-6">
        <div className='absolute top-4 right-4'>
        <select
          value={selectedLang}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className='bg-gray-800 outline-none p-1 px-4 rounded-md'
        >
          <option value="en">English</option>
          <option value="np">नेपाली</option>
          <option value="ja">日本語</option>
        </select>
      </div>
        {data?.image && (
          <div className="w-full flex justify-center">
            <img
              src={`${API_URL}/${data.image}`}
              alt="Restaurant Logo"
              className="w-32 h-32 object-cover rounded-full border border-gray-700"
            />
          </div>
        )}

        <h1 className="text-2xl font-semibold text-center">
          Welcome to <span className="block text-green-500">{data?.restaurant}</span>
        </h1>

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm">{t('Login.enterFullName')}</label>
          <input
            type="text"
            name="name"
            placeholder="Roshan Magar"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm">{t('Login.enterMobileNumber')}</label>
          <input
            type="text"
            name="phone"
            placeholder="98XXXXXXXX"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-green-700 hover:bg-green-600 transition rounded text-white font-semibold"
        >
          {t('Login.letsGo')}
        </button>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSkip}
            className="flex items-center text-sm text-gray-400 hover:text-white mt-2 underline"
          >
            {t('Login.skip')}
            <IoIosArrowForward className="ml-1" size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
