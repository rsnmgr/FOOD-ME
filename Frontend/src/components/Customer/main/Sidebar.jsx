// Sidebar.js
import  { useContext, useEffect, useState } from 'react';
import axios from 'axios'; 
import { CustomerContext } from '../../ContextProvider/CustomerContext';
import {playClickSound} from '../../ClickSound/click'
import io from 'socket.io-client';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

export default function Sidebar({ onCategorySelect }) {
  const {AdminId} = useContext(CustomerContext);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All'); // Set 'All' as the default active category
  const { t} = useTranslation('customer');

  // Function to fetch categories from the server
  const fetchCategories = async () => {
    try {
      const categoryResponse = await axios.get(`${API_URL}/api/categories/${AdminId}`);
      const activeCategories = categoryResponse.data.categories.filter(category => category.status === 'Active');
      setCategories(activeCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch categories when AdminId changes or component mounts
  useEffect(() => {
    if (AdminId) {
      fetchCategories();
    }
  }, [AdminId]);

  // Socket event listeners for category updates
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
    setActiveCategory(categoryName); // Set the clicked category as active
    onCategorySelect(categoryName);
  };

  return (
    <div>
      {/* "All" category to show all products */}
      <div
        className={`p-3 text-white text-center cursor-pointer border border-gray-700 ${activeCategory === 'All' ? 'bg-gray-900' : ''}`}
        onClick={() => handleCategoryClick('All')} // Click handler for "All"
      >
        {t('home.all')}
      </div>

      {/* Render other categories */}
      {categories.length > 0 ? (
        categories.map((category) => (
          <div
            key={category._id}
            className={`p-3 text-white text-center cursor-pointer border border-gray-700 ${activeCategory === category._id ? 'bg-gray-900' : ''}`}
            onClick={() => {playClickSound();handleCategoryClick(category._id)}} // Click handler for categories
            style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} // Ensure long text fits
            title={category.name} // Tooltip for full category name on hover
          >
            {category.name}
          </div>
        ))
      ) : (
        <div className='text-center text-gray-500'>Empty</div>
      )}
    </div>
  );
}
