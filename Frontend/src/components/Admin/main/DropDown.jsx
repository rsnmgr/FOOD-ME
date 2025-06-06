import { RxCross1 } from "react-icons/rx";
import { MdEmojiEmotions } from "react-icons/md";
import { AiOutlineUser } from "react-icons/ai";
import { PiSignOutBold } from "react-icons/pi";
import { IoSettingsOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const API_URL = import.meta.env.VITE_API_URL;

export default function DropDown({ profileClick, setSidebar, userData }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleItemClick = (page) => {
    setSidebar(false);
    profileClick(false);
    navigate(page);
  };

  const logOutUser = async () => {
    let token = localStorage.getItem("TokenFoodMe");
    const res = await fetch(`${API_URL}/api/logout`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });
    if (res.status === 201) {
      localStorage.removeItem("TokenFoodMe");
      navigate("/login");
    } else {
      navigate("/*");
    }
  };

  return (
    <div className="text-slate-300 text-[12px]">
      <div className="space-y-4 border-b border-gray-500">
        <div className="flex justify-between items-center gap-8">
          <div className="flex justify-start gap-3 items-center">
            {userData && userData.image ? (
              <img
                src={`${API_URL}/${userData.image}`}
                alt=""
                className="w-6 h-6 rounded-full bg-gray-800 object-cover border border-gray-400 cursor-pointer"
              />
            ) : (
              <h1 className="w-8 h-8 flex justify-center items-center rounded-full object-cover text-white font-bold border border-gray-400 cursor-pointer">
                {userData?.name?.[0].toUpperCase()}
              </h1>
            )}
            <div className="space-y-[-2px] ">
              <span>{userData.name}</span>
              <span className="block text-slate-400">{userData.email}</span>
            </div>
          </div>
          <div
            className="hover:bg-gray-800 rounded-full p-1 cursor-pointer"
            title={t("close")}
            onClick={profileClick}
          >
            <RxCross1 size={16} />
          </div>
        </div>
        <div className="flex justify-start items-center space-x-2 p-2 hover:bg-gray-800 rounded-md cursor-pointer">
          <MdEmojiEmotions size={18} className="text-slate-400" />
          <span>{t("setStatus")}</span>
        </div>
      </div>
      <div className="mt-2">
        <div
          className="flex justify-start items-center space-x-2 p-2 hover:bg-gray-800 rounded-md cursor-pointer"
          onClick={() => handleItemClick("/admin/profile")}
        >
          <AiOutlineUser size={18} />
          <span>{t("yourProfile")}</span>
        </div>
        <div
          className="flex justify-start items-center space-x-2 p-2 hover:bg-gray-800 rounded-md cursor-pointer"
          onClick={() => handleItemClick("/admin/settings/profile")}
        >
          <IoSettingsOutline size={18} />
          <span>{t("setting")}</span>
        </div>
        <div
          className="flex justify-start items-center space-x-2 p-2 hover:bg-gray-800 rounded-md cursor-pointer"
          onClick={logOutUser}
        >
          <PiSignOutBold size={18} />
          <span>{t("signOut")}</span>
        </div>
      </div>
    </div>
  );
}
