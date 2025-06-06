import { RxCross2 } from "react-icons/rx";
import { IoLogoTableau } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export default function Notification({ notifications, setNotification }) {
  const navigate = useNavigate();
  const { t} = useTranslation('customer');

  const handleNotificationClick = (orderId) => {
    // Save the clicked orderId in localStorage
    const clickedNotifications = JSON.parse(localStorage.getItem('clickedNotifications')) || [];
    if (!clickedNotifications.includes(orderId)) {
      clickedNotifications.push(orderId);
      localStorage.setItem('clickedNotifications', JSON.stringify(clickedNotifications));
    }

    // Navigate to /menu/bill
    navigate('/menu/bill');

    setNotification(false);
  };
const capitalizeStatus = (status) => status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className="">
      <div className="flex justify-between items-center p-2 px-4 border-b border-gray-600">
        <h1 className="text-white font-semibold">{t('home.notifications')}</h1>
        <RxCross2
          size={20}
          className="cursor-pointer"
          onClick={() => setNotification(false)}
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[400px]">
        {!notifications || notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <IoLogoTableau size={40} className="text-gray-500 mb-3" />
            <p className="text-sm text-center text-gray-400">{t('home.noNotification')}</p>
          </div>
        ) : (
          [...notifications].reverse().map((item) => (
            <div
              key={item.orderId + item.status}
              onClick={() => handleNotificationClick(item.orderId)}
              className="flex px-4 space-x-3 border-b border-gray-600 py-2 hover:bg-gray-800 cursor-pointer"
            >
              <IoLogoTableau size={20} />
              <div className="text-sm text-gray-300">
                <p className="leading-tight mb-0.5">
                  {t(`home.order${capitalizeStatus(item.status)}`, { title: item.title })}
                </p>
                <span className="text-[12px] text-gray-400 block -mt-0.5">
                  {new Date(item.date).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}