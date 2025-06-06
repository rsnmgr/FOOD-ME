import { LiaUserSolid } from "react-icons/lia";
import { IoMdSettings } from "react-icons/io";
import { IoNotifications } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function Sidebar({ activePage, setActivePage, userRole }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const menuItems = [
    { name: "Profile", icon: <LiaUserSolid className="text-gray-500" size={20} />, labelKey: "publicProfile" },
    { name: "Account", icon: <IoMdSettings className="text-gray-500" size={20} />, labelKey: "account", show: userRole === "admin" },
    { name: "Notification", icon: <IoNotifications className="text-gray-500" size={20} />, labelKey: "sound" },
    { name: "Security", icon: <FaLock className="text-gray-500" size={20} />, labelKey: "privacySecurity", show: userRole === "admin" },
  ];

  const handleNavigation = (page) => {
    navigate(`/admin/settings/${page.toLowerCase()}`);
    setActivePage(page);
  };

  return (
    <div>
      <ul className="space-y-1">
        {menuItems.map(
          (item) =>
            item.show !== false && (
              <li
                key={item.name}
                className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer ${
                  activePage === item.name ? "bg-gray-800 text-white" : "hover:bg-gray-800 text-gray-400"
                }`}
                onClick={() => handleNavigation(item.name)}
              >
                {item.icon}
                <span className="text-sm">{t(item.labelKey)}</span>
              </li>
            )
        )}
      </ul>
    </div>
  );
}
