import { useState, useEffect, useContext } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { LoginContext } from '../components/ContextProvider/Context';

/* Components */
import Sidebar from '../components/Admin/main/Sidebar';
import Header from '../components/Admin/main/Header';

/* Pages */
import Dashboard from '../components/admin/pages/Dashboard';
import Table from '../components/admin/pages/Tables';
import Cashier from '../components/Admin/pages/Cashier';
import Kitchen from '../components/admin/pages/Kitchen';
import Setting from '../components/admin/pages/Setting';
import Profile from '../components/Admin/pages/Profile';
import Inactive from './inactive';

/* Menu */
import MenuCategory from '../components/Admin/pages/menu/MenuCategory';
import MenuProduct from '../components/Admin/pages/menu/MenuProduct';
import Units from '../components/Admin/pages/menu/units';

/* Staff */
// import StaffCategory from '../components/Admin/pages/staff/staffCategory';
import StaffDetails from '../components/Admin/pages/staff/StaffDetails';

/* Report */
import Sales from '../components/Admin/pages/report/Sales';
import Purchase from '../components/Admin/pages/report/Purchase';

/* Table Menu */
import TableMenu from '../components/Admin/pages/TableMenu';
import Main from '../components/Admin/pages/TableMenu/Main';
const API_URL = import.meta.env.VITE_API_URL;
import { useTranslation } from 'react-i18next';

export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebar, setSidebar] = useState(false);
  const { setLoginData } = useContext(LoginContext);

  const [profile, setProfile] = useState(false);
  const [userRole, setUserRole] = useState(null); // ⬅️ State for role
  const [userCategory, setUserCategory] = useState(null); // ⬅️ State for category
  
  const profileClick = () => {
    setProfile(!profile);
    setSidebar(false);
  };

  const toggleSidebar = () => {
    setSidebar(!sidebar);
    setProfile(false);
  };

  const admin = async () => {
    const token = localStorage.getItem("TokenFoodMe");
    const res = await fetch(`${API_URL}/api/validUser`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });
    const data = await res.json();
    
    if (res.status === 401 || !data || (data.validUser.role !== 'admin' && data.validUser.role !== 'staff')) {
      navigate("/unAuthorized");
      return;
    }
    
    setLoginData(data);
    setUserRole(data.validUser.role);
    setUserCategory(data.validUser.category);
    
    // Check if the user account is inactive
    if (data.isInactive) {
      navigate("/inactive");
      return;
    }
    
    if (location.pathname === "/admin") {
      navigate("/admin/dashboard");
    }
  };

  useEffect(() => {
    admin();
  }, []);

  const { t } = useTranslation();

  // Map paths to titles
  const getPageTitle = (path) => {
    switch (path) {
      case "/admin/dashboard": return t("dashboard");
      case "/admin/table": return t("tables");
      case "/admin/cashier": return t("cashier");
      case "/admin/kitchen": return t("kitchen");
      case "/admin/menu/category": return t("category");
      case "/admin/menu/product": return t("product");
      case "/admin/menu/units": return t("units");
      // case "/admin/staff/category": return t("staffCategory");
      case "/admin/staff/detail": return t("staffDetails");
      case "/admin/report/sales": return t("sales");
      case "/admin/report/purchase": return t("purchase");
      case "/admin/profile": return t("profile");
      case "/admin/settings/profile": return t("setting");
      case "/admin/table-menu": return t("tableMenu");
      case "/admin/table-menu/main": return t("menu");
      default: return "Dashboard";
    }
  };

  const headerTitle = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div
        className={`rounded-2xl md:rounded-none top-0 left-0 transition-all duration-500 overflow-hidden bg-gray-900 h-screen z-50 ${
          !sidebar
            ? "-translate-x-full lg:translate-x-0 absolute lg:relative w-0 lg:w-[20vw]"
            : "translate-x-0 lg:-translate-x-full absolute lg:relative w-[70%] lg:w-0"
        }`}
      >
        <Sidebar setSidebar={setSidebar} userRole={userRole} userCategory={userCategory} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col w-full h-full">
        <div className="p-3 shadow-md border-b border-gray-800">
          <Header
            toggleSidebar={toggleSidebar}
            profileClick={profileClick}
            profile={profile}
            title={headerTitle}
            setSidebar={setSidebar}
            setProfile={setProfile}
            userRole={userRole}
          />
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-950 ">
        <Routes>
          {/* All users (admin, kitchen staff, waiter staff) */}
          <Route path="dashboard" element={<Dashboard userRole={userRole} userCategory={userCategory}/>} />
          <Route path="kitchen" element={<Kitchen userRole={userRole} userCategory={userCategory} />} />
          <Route path="profile" element={<Profile userRole={userRole} />} />
          <Route path="settings/*" element={<Setting userRole={userRole} />} />

          {/* Waiter staff has access to cashier */}
          {userRole === "staff" && userCategory === "waiter" && (
            <>
              <Route path="cashier" element={<Cashier userRole={userRole} />} />
              <Route path="table-menu" element={<TableMenu userRole={userRole}/>} />
              <Route path="table-menu/main" element={<Main userRole={userRole}/>} />
            </>
          )}

          {/* Admin gets access to everything */}
          {userRole === "admin" && (
            <>
              <Route path="table" element={<Table />} />
              <Route path="cashier" element={<Cashier userRole={userRole} />} />
              <Route path="menu/category" element={<MenuCategory />} />
              <Route path="menu/product" element={<MenuProduct />} />
              <Route path="menu/units" element={<Units />} />
              {/* <Route path="staff/category" element={<StaffCategory />} /> */}
              <Route path="staff/detail" element={<StaffDetails />} />
              <Route path="report/sales" element={<Sales />} />
              <Route path="report/purchase" element={<Purchase />} />
              <Route path="table-menu" element={<TableMenu userRole={userRole}/>} />
              <Route path="table-menu/main" element={<Main userRole={userRole}/>} />
            </>
          )}
        </Routes>
        </div>
      </div>
    </div>
  );
}
