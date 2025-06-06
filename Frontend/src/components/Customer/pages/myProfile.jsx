import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { playClickSound } from "../../ClickSound/click";
const API_URL = import.meta.env.VITE_API_URL;
import { CustomerContext } from "../../ContextProvider/CustomerContext";
import { useTranslation } from 'react-i18next';

export default function MyProfile() {
  const [orderNotification, setOrderNotification] = useState(false);
  const [buttonClickSound, setButtonClickSound] = useState(false);
  const { CustomerId, AdminId } = useContext(CustomerContext);
  const [customerData, setCustomerData] = useState(null);
  const navigate = useNavigate();
  const { t,i18n } = useTranslation('customer');
    const [selectedLang, setSelectedLang] = useState(localStorage.getItem('i18nextLng') || 'en');
    const handleLanguageChange = (lang) => {
      i18n.changeLanguage(lang);
      localStorage.setItem('i18nextLng', lang);
      setSelectedLang(lang);
    };
  const fetchCustomerData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/get-customer/${AdminId}/${CustomerId}`);
      const data = await response.json();
      setCustomerData(data);
    } catch (err) {
      console.error("Failed to fetch customer data", err);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [AdminId, CustomerId]);

  useEffect(() => {
    const savedOrder = localStorage.getItem("notification");
    const savedSound = localStorage.getItem("buttonClickSound");
    if (savedOrder === "on") setOrderNotification(true);
    if (savedSound === "on") setButtonClickSound(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("notification", orderNotification ? "on" : "off");
  }, [orderNotification]);

  useEffect(() => {
    localStorage.setItem("buttonClickSound", buttonClickSound ? "on" : "off");
  }, [buttonClickSound]);

  if (!customerData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-900">
      <div className="relative bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-sm text-white">
        <div className='absolute top-4 right-4'>
        <select
          value={selectedLang}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className='bg-gray-900 outline-none p-1 px-4 rounded-md'
        >
          <option value="en">English</option>
          <option value="np">नेपाली</option>
          <option value="ja">日本語</option>
        </select>
      </div>
        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-blue-600  flex items-center justify-center text-3xl font-bold shadow">
            {customerData.name?.[0]?.toUpperCase()}
          </div>
        </div>

        {/* Customer Info */}
        <h2 className="text-2xl font-semibold text-center">{customerData.name}</h2>
        <p className="text-sm text-gray-300 text-center mt-1">{customerData.phone}</p>
        <p className="text-xs text-gray-400 text-center mb-6">Table ID: {customerData.tableId}</p>

        {/* Settings */}
        <div className="space-y-4 text-left">
          <div className="flex justify-between items-center">
            <label htmlFor="order-notification" className="text-gray-200 font-medium">
             {t('myprofile.orderNotification')}
            </label>
            <input
              id="order-notification"
              type="checkbox"
              className="w-5 h-5"
              checked={orderNotification}
              onChange={() => {
                if (buttonClickSound) playClickSound();
                setOrderNotification(prev => !prev);
              }}
            />
          </div>
          <div className="flex justify-between items-center">
            <label htmlFor="click-sound" className="text-gray-200 font-medium">
              {t('myprofile.buttonClickSound')}
            </label>
            <input
              id="click-sound"
              type="checkbox"
              className="w-5 h-5"
              checked={buttonClickSound}
              onChange={() => {
                if (buttonClickSound) playClickSound();
                setButtonClickSound(prev => !prev);
              }}
            />
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate("/menu")}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg font-semibold shadow"
        >
         {t('myprofile.backToMenu')}
        </button>
      </div>
    </div>
  );
}
