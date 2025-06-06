import { useContext, useEffect, useState } from 'react';
import axios from 'axios'; 
import { LoginContext } from '../../../ContextProvider/Context';
import { playClickSound } from '../../../ClickSound/click';
import io from 'socket.io-client';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

export default function Sidebar({ onCategorySelect, userRole }) {
  const { loginData } = useContext(LoginContext);
  const AdminId = userRole === "admin"
    ? loginData?.validUser?._id
    : loginData?.validUser?.AdminId;
  const { t } = useTranslation();

  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');

  const fetchCategories = async () => {
    try {
      const categoryResponse = await axios.get(`${API_URL}/api/categories/${AdminId}`);
      const activeCategories = categoryResponse.data.categories.filter(category => category.status === 'Active');
      setCategories(activeCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    if (AdminId) fetchCategories();
  }, [AdminId]);

  useEffect(() => {
    socket.on('categoryAdded', fetchCategories);
    socket.on('categoryUpdated', fetchCategories);
    socket.on('categoryDeleted', fetchCategories);
    return () => {
      socket.off('categoryAdded', fetchCategories);
      socket.off('categoryUpdated', fetchCategories);
      socket.off('categoryDeleted', fetchCategories);
    };
  }, []);

  const handleCategoryClick = (categoryName) => {
    setActiveCategory(categoryName);
    onCategorySelect(categoryName);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sticky "All" button */}
      <div className="sticky top-0 z-10 bg-black">
        <div
          className={`p-3 text-white text-center cursor-pointer border border-gray-700 ${activeCategory === 'All' ? 'bg-gray-900' : ''}`}
          onClick={() => handleCategoryClick('All')}
        >
        {t('all')}
        </div>
      </div>

      {/* Scrollable category list */}
      <div className="flex-1 overflow-y-auto">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div
              key={category._id}
              className={`p-3 text-white text-center cursor-pointer border border-gray-700 ${activeCategory === category._id ? 'bg-gray-900' : ''}`}
              onClick={() => { playClickSound(); handleCategoryClick(category._id); }}
              style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              title={category.name}
            >
              {category.name}
            </div>
          ))
        ) : (
          <div className='text-center text-gray-500'>{t('empty')}</div>
        )}
      </div>
    </div>
  );
}
