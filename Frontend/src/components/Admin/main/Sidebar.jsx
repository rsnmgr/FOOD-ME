import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // <-- Import here

/* React Icons */
import { RxDashboard, RxCross2 } from "react-icons/rx";
import { GiTabletopPlayers } from "react-icons/gi";
import { MdCountertops } from "react-icons/md";
import { FaKitchenSet, FaChevronDown, FaUsers } from "react-icons/fa6";
import { TbReportSearch } from "react-icons/tb";
import { FaJediOrder } from "react-icons/fa6";

export default function Sidebar({ setSidebar, userRole, userCategory }) {
  const { t } = useTranslation();  // <-- Hook for translation
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  };

  const handleItemClick = (path) => {
    navigate(path);
    setSidebar(false);
  };

  const isActive = (path) => location.pathname === path;

  const isAdmin = userRole === 'admin';
  const isStaff = userRole === 'staff';

  // Permissions
  const canAccessCashier = isAdmin || (isStaff && userCategory === 'waiter');
  const canAccessKitchen = isAdmin || isStaff;

  return (
    <div>
      <div className="flex justify-between lg:justify-start p-3 shadow-md border-b border-gray-600">
        <h1>FOOD ME</h1>
        <RxCross2 size={20} onClick={() => setSidebar(false)} className="lg:hidden cursor-pointer" />
      </div>

      <ul>
        {/* Common: Dashboard */}
        <li
          className={`flex items-center p-3 space-x-3 cursor-pointer ${
            isActive('/admin/dashboard') ? 'bg-gray-800 text-white' : 'bg-gray-900'
          }`}
          onClick={() => handleItemClick('/admin/dashboard')}
        >
          <RxDashboard size={18} />
          <span>{t('dashboard')}</span>
        </li>

        {/* Admin Only: Menu */}
        {isAdmin && (
          <li className="flex flex-col border-y border-gray-600">
            <div
              className="flex items-center justify-between p-3 cursor-pointer border-b border-gray-600"
              onClick={() => toggleDropdown('Menu')}
            >
              <div className="flex items-center space-x-3">
                <FaKitchenSet size={18} />
                <span>{t('menu')}</span>
              </div>
              <FaChevronDown
                className={`transform transition-transform duration-300 ${
                  activeDropdown === 'Menu' ? 'rotate-180' : ''
                }`}
              />
            </div>
            {activeDropdown === 'Menu' && (
              <ul className="ml-6">
                <li
                  className={`p-3 cursor-pointer ${
                    isActive('/admin/menu/category') ? 'bg-gray-800 text-white' : 'bg-gray-900'
                  }`}
                  onClick={() => handleItemClick('/admin/menu/category')}
                >
                  {t('category')}
                </li>
                <li
                  className={`p-3 cursor-pointer ${
                    isActive('/admin/menu/units') ? 'bg-gray-800 text-white' : 'bg-gray-900'
                  }`}
                  onClick={() => handleItemClick('/admin/menu/units')}
                >
                  {t('units')}
                </li>
                <li
                  className={`p-3 cursor-pointer ${
                    isActive('/admin/menu/product') ? 'bg-gray-800 text-white' : 'bg-gray-900'
                  }`}
                  onClick={() => handleItemClick('/admin/menu/product')}
                >
                  {t('product')}
                </li>
              </ul>
            )}
          </li>
        )}

        {/* Admin Only: Tables */}
        {isAdmin && (
          <li
            className={`flex items-center p-3 space-x-3 cursor-pointer ${
              isActive('/admin/table') ? 'bg-gray-800 text-white' : 'bg-gray-900'
            }`}
            onClick={() => handleItemClick('/admin/table')}
          >
            <GiTabletopPlayers size={18} />
            <span>{t('tables')}</span>
          </li>
        )}

        {/* Accessible: Cashier (Admin + Waiter Staff only) */}
        {canAccessCashier && (
          <li
            className={`flex items-center p-3 space-x-3 cursor-pointer ${
              isActive('/admin/cashier') ? 'bg-gray-800 text-white' : 'bg-gray-900'
            }`}
            onClick={() => handleItemClick('/admin/cashier')}
          >
            <MdCountertops size={18} />
            <span>{t('cashier')}</span>
          </li>
        )}

        {/* Accessible: Kitchen (Admin + all Staff) */}
        {canAccessKitchen && (
          <li
            className={`flex items-center p-3 space-x-3 cursor-pointer ${
              isActive('/admin/kitchen') ? 'bg-gray-800 text-white' : 'bg-gray-900'
            }`}
            onClick={() => handleItemClick('/admin/kitchen')}
          >
            <FaKitchenSet size={18} />
            <span>{t('kitchen')}</span>
          </li>
        )}

        {/* Accessible: Admin + waiter */}
        {(isAdmin || (userRole === 'staff' && userCategory === 'waiter')) && (
          <li
            className={`flex items-center p-3 space-x-3 cursor-pointer ${
              isActive('/admin/table-menu') ? 'bg-gray-800 text-white' : 'bg-gray-900'
            }`}
            onClick={() => handleItemClick('/admin/table-menu')}
          >
            <FaJediOrder size={18} />
            <span>{t('tableMenu')}</span>
          </li>
        )}

        {/* Admin Only: Staff */}
        {isAdmin && (
          <li className="flex flex-col border-y border-gray-600">
            <div
              className="flex items-center justify-between p-3 cursor-pointer border-b border-gray-600"
              onClick={() => toggleDropdown('Staff')}
            >
              <div className="flex items-center space-x-3">
                <FaUsers size={18} />
                <span>{t('staff')}</span>
              </div>
              <FaChevronDown
                className={`transform transition-transform duration-300 ${
                  activeDropdown === 'Staff' ? 'rotate-180' : ''
                }`}
              />
            </div>
            {activeDropdown === 'Staff' && (
              <ul className="ml-6">
                {/* <li
                  className={`p-3 cursor-pointer ${
                    isActive('/admin/staff/category') ? 'bg-gray-800 text-white' : 'bg-gray-900'
                  }`}
                  onClick={() => handleItemClick('/admin/staff/category')}
                >
                  {t('staffCategory')}
                </li> */}
                <li
                  className={`p-3 cursor-pointer ${
                    isActive('/admin/staff/detail') ? 'bg-gray-800 text-white' : 'bg-gray-900'
                  }`}
                  onClick={() => handleItemClick('/admin/staff/detail')}
                >
                  {t('staffDetails')}
                </li>
              </ul>
            )}
          </li>
        )}

        {/* Admin Only: Reports */}
        {isAdmin && (
          <li className="flex flex-col border-b border-gray-600">
            <div
              className="flex items-center justify-between p-3 cursor-pointer border-b border-gray-600"
              onClick={() => toggleDropdown('Reports')}
            >
              <div className="flex items-center space-x-3">
                <TbReportSearch size={18} />
                <span>{t('reports')}</span>
              </div>
              <FaChevronDown
                className={`transform transition-transform duration-300 ${
                  activeDropdown === 'Reports' ? 'rotate-180' : ''
                }`}
              />
            </div>
            {activeDropdown === 'Reports' && (
              <ul className="ml-6">
                <li
                  className={`p-3 cursor-pointer ${
                    isActive('/admin/report/sales') ? 'bg-gray-800 text-white' : 'bg-gray-900'
                  }`}
                  onClick={() => handleItemClick('/admin/report/sales')}
                >
                  {t('sales')}
                </li>
                <li
                  className={`p-3 cursor-pointer ${
                    isActive('/admin/report/purchase') ? 'bg-gray-800 text-white' : 'bg-gray-900'
                  }`}
                  onClick={() => handleItemClick('/admin/report/purchase')}
                >
                  {t('purchase')}
                </li>
              </ul>
            )}
          </li>
        )}
      </ul>
    </div>
  );
}
