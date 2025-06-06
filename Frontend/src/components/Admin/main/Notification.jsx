import { RxCross2 } from "react-icons/rx";
import { IoLogoTableau } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Notification({ setNotification, notifications, markNotificationSeen }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleNotificationClick = (notif) => {
    const { tableId, orderHistoryId } = notif;
    markNotificationSeen(tableId, orderHistoryId);
    navigate(`/admin/kitchen`);
    setNotification(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center p-2 px-4 border-b border-gray-600">
        <h1>{t("notification")}</h1>
        <RxCross2 size={20} className="cursor-pointer" onClick={() => setNotification(false)} />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar h-[470px] max-h-[524px]">
        {notifications.length > 0 ? (
          notifications.map((notif, index) => (
            <div
              key={index}
              className="flex px-4 space-x-3 border-b border-gray-600 py-2 hover:bg-gray-800 cursor-pointer"
              onClick={() => handleNotificationClick(notif)}
            >
              <IoLogoTableau size={20} className={notif.type === "newOrder" ? "text-green-400" : "text-yellow-400"} />
              <div className="text-sm text-gray-300">
                <p className="leading-tight mb-0.5">{t(notif.messageKey, notif.messageParams)}</p>
                <span className="text-[12px] text-gray-400 block -mt-0.5">
                  {new Date(notif.timestamp).toLocaleString()}
                </span>
              </div>
              {notif.seen === "false" && (
                <span className="text-xs text-red-500 ml-auto">{t("unseen")}</span>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 py-4">{t("noNotification")}</p>
        )}
      </div>
    </div>
  );
}
