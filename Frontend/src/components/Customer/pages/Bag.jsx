import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { IoIosArrowUp } from "react-icons/io";
import { MdShoppingCart } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { TiMinus } from "react-icons/ti";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { TiTick } from "react-icons/ti";
import io from 'socket.io-client';
import {playClickSound} from '../../ClickSound/click'
import { useTranslation } from 'react-i18next';

import { CustomerContext } from '../../ContextProvider/CustomerContext';
import { ToastContainer, toast } from 'react-toastify'; // Import toastify

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

export default function Bag() {
  const { customerData, AdminId, tableId,ipAddress } = useContext(CustomerContext);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [selectedItemInstructions, setSelectedItemInstructions] = useState("");
  const [editableInstructions, setEditableInstructions] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const CustomerId = customerData?.validUser?._id;
  const { t} = useTranslation('customer');

  const fetchSelectedItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/selected-items/${AdminId}/${tableId}/${CustomerId}`);
      const { selectedItems } = response.data.selectedItemsEntry;

      if (selectedItems.length === 0) {
        setIsEmpty(true);
      } else {
        setSelectedItems(selectedItems);
        setIsEmpty(false);
      }
    } catch (error) {
      console.error("Error fetching selected items:", error);
      setIsEmpty(true);
    }
  };

  const updateItemQuantity = async (itemId, quantity) => {
    try {
      await axios.put(`${API_URL}/api/selected-items/${AdminId}/${tableId}/${CustomerId}/${itemId}/quantity`, { quantity });
    } catch (error) {
      console.error("Error updating item quantity:", error);
    }
  };

  const handleQuantityChange = async (index, change) => {
    const updatedItems = [...selectedItems];
    const newQuantity = updatedItems[index].quantity + change;

    if (newQuantity > 0) {
      updatedItems[index].quantity = newQuantity;
      setSelectedItems(updatedItems);
      await updateItemQuantity(updatedItems[index]._id, newQuantity);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/selected-items/${AdminId}/${tableId}/${CustomerId}/${itemToDelete._id}`);
      const updatedItems = selectedItems.filter((item) => item._id !== itemToDelete._id);
      setSelectedItems(updatedItems);
      setShowModal(false);
      setIsEmpty(updatedItems.length === 0);
    } catch (error) {
      console.error("Error deleting selected item:", error);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItemInstructions(item.instructions || "No instructions available.");
    setEditingItemId(item._id);
    setEditableInstructions(item.instructions || "");
    setShowInstructions(true);
  };

  const handleInstructionsChange = (event) => {
    setEditableInstructions(event.target.value);
  };

  const handleUpdateInstructions = async () => {
    try {
      await axios.put(`${API_URL}/api/update-item-instructions/${AdminId}/${tableId}/${CustomerId}/${editingItemId}`, {
        instructions: editableInstructions,
      });
      const updatedItems = selectedItems.map((item) =>
        item._id === editingItemId ? { ...item, instructions: editableInstructions } : item
      );
      setSelectedItems(updatedItems);
      setSelectedItemInstructions(editableInstructions);
      setShowInstructions(false);
    } catch (error) {
      console.error("Error updating item instructions:", error);
    }
  };

  const handleOrderNowClick = () => {
    setShowOrderConfirmation(true);
  };
  const handleOrderConfirmation = async () => {
    setShowOrderConfirmation(false);
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/add-order`, {
        AdminId,
        tableId,
        CustomerId,
        items: selectedItems,
        ipAddress,
      });
      await axios.delete(`${API_URL}/api/delete-selected-items/${AdminId}/${tableId}/${CustomerId}`);
      setTimeout(() => {
        setLoading(false);
        navigate(`/menu/bill`);
      }, 1000);
  
    } catch (error) {
      setLoading(false);
  
      // Extract the error message from the backend
      const errorMessage =
        error?.response?.data?.message;
  
      toast.error(errorMessage); // Show the error message in toast
  
      console.error("Error placing order:", error);
    }
  };
  

  useEffect(() => {
    if (AdminId) {
      fetchSelectedItems();
    }
  }, [AdminId]);

  useEffect(() => {
    socket.on('ItemsAdded', fetchSelectedItems);
    socket.on('ItemsUpdated', fetchSelectedItems);
    socket.on('ItemsDeleted', fetchSelectedItems);
    socket.on('ItemsQtyUpdated', fetchSelectedItems);
    socket.on('ItemsDeletedAll', fetchSelectedItems);

    return () => {
      socket.off('ItemsAdded', fetchSelectedItems);
      socket.off('ItemsUpdated', fetchSelectedItems);
      socket.off('ItemsDeleted', fetchSelectedItems);
      socket.off('ItemsQtyUpdated', fetchSelectedItems);
      socket.off('ItemsDeletedAll', fetchSelectedItems);
    };
  }, []);


  const calculateTotalAmount = () => {
    return selectedItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  };
  
  return (
    <div>
      <header className="flex justify-between items-center p-2 shadow-xl">
        <div className="flex items-center">
          <IoIosArrowUp
            className="transform rotate-[-90deg] w-6 h-6 cursor-pointer"
            onClick={() => {navigate(`/menu`); playClickSound();}}
          />
          <span>{t('bag.back')}</span>
        </div>
        <div className="flex items-center">
          <MdShoppingCart className="w-6 h-6" />
          <h1 className="">{t('bag.orderCard')}</h1>
        </div>
      </header>

      <main className="p-2">
        <div className="overflow-y-auto" style={{ maxHeight: "375px" }}>
          {isEmpty ? (
            <p className="text-center">{t('bag.no_items_in_cart')}</p>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {selectedItems.map((item, index) => (
                <div key={item._id} className="grid grid-cols-3 bg-gray-800 shadow-2xl p-4">
                  <div className="flex justify-left items-center gap-2">
                    <div
                      className="bg-red-700 rounded-full p-1 text-white cursor-pointer"
                      onClick={() => {
                        setShowModal(true);
                        setItemToDelete(item);
                        playClickSound();
                      }}
                    >
                      <RxCross2 />
                    </div>
                    <div onClick={() => handleItemClick(item)} className="relative cursor-pointer">
                      <h1 className="text-sm space-y-[-6px]">
                        <span>{item.name}</span><span className="block text-[8px]">{item.size && `(${item.size})`}</span>
                      </h1>
                    </div>
                  </div>

                  <div className="flex justify-center items-center gap-3">
                    <div
                      className="p-1 bg-gray-700 text-white cursor-pointer"
                      onClick={() => {handleQuantityChange(index, -1); playClickSound();}}
                    >
                      <TiMinus />
                    </div>
                    <p>{item.quantity}</p>
                    <div
                      className="p-1 bg-gray-700 text-white cursor-pointer"
                      onClick={() => {handleQuantityChange(index, 1); playClickSound();}}
                    >
                      <FaPlus />
                    </div>
                  </div>

                  <div className="flex justify-end items-center gap-2">
                    <h1>{item.price * item.quantity}</h1>
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-12 h-12 hidden rounded" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isEmpty && (
          <div className="flex justify-between items-center bg-gray-800 text-white p-3 mt-4 rounded shadow-md">
            <span className="text-lg font-medium">{t('bag.totalAmount')}</span>
            <span className="text-lg font-bold">₹{calculateTotalAmount()}</span>
          </div>
        )}

        {!isEmpty && (
          <div className="flex text-center gap-2 mt-4 shadow-2xl">
            <button
              className="bg-green-700 text-white p-2 w-full hover:bg-green-800 focus:ring-2 focus:ring-green-500 focus:outline-none"
              onClick={()=>{handleOrderNowClick(); playClickSound();}}
            >
              {t('bag.orderNow')}
            </button>
          </div>
        )}
      </main>

      {showOrderConfirmation && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-md shadow-lg text-center w-[80vw] md:w-[25vw]">
            <h2 className="text-xl mb-4">{t('bag.confirmOrderTitle')}</h2>
            <p className="mb-6">{t('bag.confirmOrderMessage')}</p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-gray-700 text-white px-4 py-2 rounded"
                onClick={() => {setShowOrderConfirmation(false); playClickSound();}}
              >
                {t('bag.cancel')}
              </button>
              <button
                className="bg-green-700 text-white p-2 rounded hover:bg-green-800 focus:ring-2 focus:ring-green-500 focus:outline-none"
                onClick={()=>{handleOrderConfirmation(); playClickSound();} }
              >
                {t('bag.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-900 border border-gray-700 w-[80vw] md:w-[25vw] p-6 rounded shadow-lg">
            <h2 className="text-xl mb-4">{t('bag.confirmDelete')}</h2>
            <p className="mb-4">{t('bag.confirmDeleteText')}</p>
            <div className="flex justify-end gap-4">
              <button
                className="bg-gray-700 text-white px-4 py-2 rounded"
                onClick={() => {setShowModal(false); playClickSound();} }
              >
                {t('bag.cancel')}
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={()=>{handleDelete(); playClickSound();} }
              >
                {t('bag.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showInstructions && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center p-2">
          <div className="bg-gray-900 border border-gray-700 w-full md:w-1/2 p-6 rounded shadow-lg">
            <h2 className="text-xl mb-4">{t("bag.instruction")}</h2>
            <textarea
              className="w-full h-40 p-2 border border-gray-500 bg-gray-900 rounded"
              value={editableInstructions}
              onChange={handleInstructionsChange}
            />
            <div className="flex justify-end mt-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                onClick={() => {setShowInstructions(false); playClickSound();} }
              >
                {t("bag.cancel")}
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={()=>{handleUpdateInstructions(); playClickSound();} }
              >
                {t("bag.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center p-4 justify-center px-2">
          <div className="bg-gray-900 border border-gray-700 p-6 md:w-1/3 h-auto rounded shadow-lg">
            <div className="flex justify-center items-center mt-10">
              <TiTick size={72} className="text-white bg-green-700 p-2 rounded-full" />
            </div>
            <h1 className="text-center">{t('bag.success')}</h1>
            <p className="text-center text-gray-500">{t('bag.orderPlacedMessage')}</p>
            <button className="bg-green-700 p-2 w-full mt-4" onClick={() => {navigate(`/menu/b`);playClickSound()}}>{t('bag.done')}</button>
          </div>
        </div>
      )}
      <ToastContainer /> {/* Add ToastContainer to your component */}
    </div>
  );
}
