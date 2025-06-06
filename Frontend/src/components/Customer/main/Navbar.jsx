// Navbar.js
import { useState, useEffect, useContext } from 'react';
import { LuSearch } from 'react-icons/lu';
import { MdShoppingCart } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { CustomerContext } from '../../ContextProvider/CustomerContext';
import axios from 'axios';
import io from 'socket.io-client';
import {playClickSound} from '../../ClickSound/click'
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

export default function Navbar({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState(''); // State for search input
  const {customerData,AdminId, tableId} = useContext(CustomerContext);
  const [itemCount, setItemCount] = useState(0); // Number of unique items
  const [totalAmount, setTotalAmount] = useState(0); // Total cost of items
  const navigate = useNavigate();
  const { t} = useTranslation('customer');
  const CustomerId = customerData?.validUser?._id;
  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value); // Pass the search query to the parent component
  };

  // Fetch and update cart data
  const updateCart = async () => {
    try {
      const cartResponse = await axios.get(`${API_URL}/api/selected-items/${AdminId}/${tableId}/${CustomerId}`);
      const selectedItems = cartResponse.data.selectedItemsEntry?.selectedItems || [];

      let count = 0;
      let totalPrice = 0;

      selectedItems.forEach((item) => {
        count += 1; // Increment unique item count
        totalPrice += item.quantity * item.price; // Calculate total price
      });

      setItemCount(count);
      setTotalAmount(totalPrice);
    } catch (error) {
      // console.error('Error updating cart:', error);
    }
  };

  // Initial fetch when AdminId is available
  useEffect(() => {
    if (AdminId && tableId) {
      updateCart();
    }
  }, [AdminId, tableId]);
  

  useEffect(() => {
    const events = ['ItemsAdded', 'ItemsUpdated', 'ItemsDeleted', 'ItemsQtyUpdated', 'ItemsDeletedAll'];
    events.forEach(event => socket.on(event, updateCart));
  
    return () => {
      events.forEach(event => socket.off(event, updateCart));
    };
  }, [AdminId, tableId]);
  

  return (
    <div>
      <div className="flex justify-between items-center p-2 bg-gray-900 space-x-4">
        {/* Search Bar */}
        <div className="relative w-full max-w-xs md:max-w-md">
          <LuSearch className="absolute inset-y-0 left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 md:w-5 md:h-5" />
          <input
            type="text"
            className="block w-full p-2 pl-10 text-sm text-gray-500 border border-gray-700 bg-gray-900 rounded-lg outline-none"
            placeholder={t('home.searchFood')}
            value={searchQuery}
            onChange={handleSearchChange} // Update search input
          />
        </div>

        {/* Shopping Cart Section */}
        <div className="flex items-center space-x-2 cursor-pointer">
          <label className="text-white">{totalAmount.toFixed(2)}</label>
          <div className="relative" onClick={() => {navigate(`/menu/bag`);playClickSound()}}>
            {/* Display unique item count */}
            <label className="absolute -top-1 -right-1 text-xs text-white bg-green-700 rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount}
            </label>
            <MdShoppingCart className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
