import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { RxCross2 } from "react-icons/rx";
import { TiMinus } from "react-icons/ti";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { playClickSound } from "../../../ClickSound/click";
import { LoginContext } from "../../../ContextProvider/Context";
import { CustomerContext } from "../../../ContextProvider/CustomerContext";
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

export default function SelectedItems({ userRole, onCartClick }) {
  const { ipAddress } = useContext(CustomerContext);
  const { loginData } = useContext(LoginContext);
  const { t } = useTranslation();

  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [editableInstructions, setEditableInstructions] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);
  const [selectedItemInstructions, setSelectedItemInstructions] = useState("");
  const [tableData, setTableData] = useState(null);

  const navigate = useNavigate();

  const AdminId =
    userRole === "admin"
      ? loginData?.validUser?._id
      : loginData?.validUser?.AdminId;
  const CustomerId = localStorage.getItem("TableId");
  const tableId = CustomerId;

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tables/${AdminId}/${tableId}`);
      setTableData(response.data.table.name);
    } catch (error) {
      console.error("Error fetching table data:", error?.response?.data?.message);
    }
  };

  const fetchSelectedItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/selected-items/${AdminId}/${tableId}/${CustomerId}`);
      const { selectedItems } = response.data.selectedItemsEntry;
      setSelectedItems(selectedItems);
    } catch (error) {
      console.error("Error fetching selected items:", error?.response?.data?.message);
    }
  };

  const updateItemQuantity = async (itemId, quantity) => {
    try {
      await axios.put(`${API_URL}/api/selected-items/${AdminId}/${tableId}/${CustomerId}/${itemId}/quantity`, { quantity });
    } catch (error) {
      console.error("Error updating item quantity:", error?.response?.data?.message);
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
      const response = await axios.delete(`${API_URL}/api/selected-items/${AdminId}/${tableId}/${CustomerId}/${itemToDelete._id}`);
      const updatedItems = selectedItems.filter(item => item._id !== itemToDelete._id);
      setSelectedItems(updatedItems);
      console.log(response.data.message || "Item deleted successfully");
      setShowModal(false);
    } catch (error) {
      console.error("Error deleting selected item:", error?.response?.data?.message);
    }
  };

  const handleOrderNowClick = () => {
    playClickSound();
    setShowOrderConfirmation(true);
  };

  const handleOrderConfirmation = async () => {
    setShowOrderConfirmation(false);
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/add-order`, {
        AdminId,
        tableId,
        CustomerId,
        items: selectedItems,
        ipAddress,
      });
      await axios.delete(`${API_URL}/api/delete-selected-items/${AdminId}/${tableId}/${CustomerId}`);
      setSelectedItems([]);
      console.log(response.data.message || "Order placed successfully");
    } catch (error) {
      console.error("Error placing order:", error?.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item) => {
    playClickSound();
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
      const response = await axios.put(
        `${API_URL}/api/update-item-instructions/${AdminId}/${tableId}/${CustomerId}/${editingItemId}`,
        { instructions: editableInstructions }
      );
      const updatedItems = selectedItems.map(item =>
        item._id === editingItemId
          ? { ...item, instructions: editableInstructions }
          : item
      );
      setSelectedItems(updatedItems);
      setSelectedItemInstructions(editableInstructions);
      setShowInstructions(false);
      console.log(response.data.message || "Instructions updated successfully");
    } catch (error) {
      console.error("Error updating item instructions:", error?.response?.data?.message || "Failed to update instructions");
    }
  };

  const calculateTotalAmount = () => {
    return selectedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  useEffect(() => {
    if (AdminId) {
      fetchSelectedItems();
    }
  }, [AdminId]);

  useEffect(() => {
    if (AdminId && tableId) {
      fetchData();
    }
  }, [AdminId, tableId]);

  useEffect(() => {
    socket.on("ItemsAdded", fetchSelectedItems);
    socket.on("ItemsUpdated", fetchSelectedItems);
    socket.on("ItemsDeleted", fetchSelectedItems);
    socket.on("ItemsQtyUpdated", fetchSelectedItems);
    socket.on("ItemsDeletedAll", fetchSelectedItems);
    return () => {
      socket.off("ItemsAdded", fetchSelectedItems);
      socket.off("ItemsUpdated", fetchSelectedItems);
      socket.off("ItemsDeleted", fetchSelectedItems);
      socket.off("ItemsQtyUpdated", fetchSelectedItems);
      socket.off("ItemsDeletedAll", fetchSelectedItems);
    };
  }, []);

  return (
    <div className="text-white relative h-full flex flex-col bg-black">
      <div className="p-0.5">
        <button className="bg-gray-800 p-3 w-full font-semibold">
          {t('dineInArea')}
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 gap-2 p-0.5">
        <div className=" text-center p-2 border-b border-gray-700 bg-gray-800 text-white font-semibold">
          <h1>{t('tableNumber')} : {tableData}</h1>
        </div>
        <div className="text-center p-2 border-b border-gray-700 bg-gray-800 text-white font-semibold">
          <h1>{t('totalSelectedItems')} : {selectedItems.length}</h1>
        </div>
      </div>

      <div className="flex flex-col flex-grow overflow-hidden p-0.5">
        <div className="border border-gray-700 rounded-lg flex flex-col h-full">
          <table className="w-full text-sm text-left table-fixed border-collapse">
            <thead className="text-xs uppercase bg-gray-800 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3">{t('product')+" "+t('name')}</th>
                <th className="px-6 py-3 text-center">{t('qty')}</th>
                <th className="px-6 py-3 text-center">{t('price')}</th>
              </tr>
            </thead>
          </table>

          <div className="overflow-y-auto bg-gray-900 rounded-b-lg" style={{ maxHeight: '66vh', paddingBottom: '20vh' }}>
            <table className="w-full text-sm text-left table-fixed border-collapse">
              <tbody>
                {selectedItems.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                      {t('tableIsBlank')}
                    </td>
                  </tr>
                ) : (
                  selectedItems.map((item, index) => (
                    <tr key={item._id} className="border-b border-gray-800">
                      <td className="flex flex-col px-6 py-2">
                        <div className="flex items-center space-x-4">
                          <div
                            className="bg-red-700 rounded-full p-1 cursor-pointer"
                            onClick={() => {
                              playClickSound();
                              setShowModal(true);
                              setItemToDelete(item);
                            }}
                          >
                            <RxCross2 />
                          </div>
                          <div
                            className="cursor-pointer hover:underline max-w-xs truncate"
                            onClick={() => handleItemClick(item)}
                            title="Click to edit instructions"
                          >
                            {item.name} ({item.size})
                          </div>
                        </div>
                        {item.instructions && (
                          <p className="text-xs text-gray-400 mt-1 italic max-w-xs truncate">
                            Note: {item.instructions}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-2 text-center">
                        <div className="flex justify-center items-center gap-3">
                          <div
                            className="p-1 bg-gray-700 cursor-pointer rounded"
                            onClick={() => {
                              playClickSound();
                              handleQuantityChange(index, -1);
                            }}
                          >
                            <TiMinus />
                          </div>
                          <p>{item.quantity}</p>
                          <div
                            className="p-1 bg-gray-700 cursor-pointer rounded"
                            onClick={() => {
                              playClickSound();
                              handleQuantityChange(index, 1);
                            }}
                          >
                            <FaPlus />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-2 text-center">
                        <div className="text-gray-500 text-sm">
                          {item.price.toFixed(2)}
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs">
                            {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 w-full p-1">
        <div className="flex justify-between items-center p-4 bg-gray-800 border-t border-gray-700 text-white font-semibold">
          <h1>{t('totalAmount')}</h1>
          <span>${calculateTotalAmount().toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center p-0.5 bg-gray-900 text-white z-50">
          <button
            className="md:hidden w-full bg-gray-800 py-2 font-semibold rounded hover:bg-gray-700"
            onClick={() => {
              playClickSound();
              onCartClick();
            }}
          >
            Back
          </button>
          <button
            className="bg-green-700 w-full py-2 font-semibold rounded hover:bg-green-600"
            onClick={() => {
              playClickSound();
              handleOrderNowClick();
            }}
            disabled={selectedItems.length === 0}
            title={selectedItems.length === 0 ? "Add items to order" : "Place Order"}
          >
            Order Now
          </button>
        </div>
      </div>

      {showModal && (
        <Modal
          message={t('confirmDeleteItems')}
          onConfirm={() => {
            playClickSound();
            handleDelete();
          }}
          onCancel={() => {
            playClickSound();
            setShowModal(false);
          }}
        />
      )}

      {showOrderConfirmation && (
        <Modal
          message={t('confirmPlaceOrder')}
          onConfirm={() => {
            playClickSound();
            handleOrderConfirmation();
          }}
          onCancel={() => {
            playClickSound();
            setShowOrderConfirmation(false);
          }}
          loading={loading}
        />
      )}

      {showInstructions && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center p-2 z-50">
          <div className="bg-gray-900 border border-gray-700 w-full md:w-1/2 p-6 rounded shadow-lg">
            <h2 className="text-xl mb-2">{t('instructions')}</h2>
            <p className="text-gray-400 mb-4">
              <span className="text-white font-medium">
                {selectedItems.find((item) => item._id === editingItemId)?.name} (
                {selectedItems.find((item) => item._id === editingItemId)?.size})
              </span>
            </p>
            <textarea
              className="w-full h-40 p-2 border border-gray-500 bg-gray-900 rounded resize-none"
              value={editableInstructions}
              onChange={handleInstructionsChange}
            />
            <div className="mt-4 flex justify-end space-x-4">
              <button
                className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                onClick={() => {
                  playClickSound();
                  setShowInstructions(false);
                }}
              >
                {t('close')}
              </button>
              <button
                className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                onClick={() => {
                  playClickSound();
                  handleUpdateInstructions();
                }}
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Modal({ message, onConfirm, onCancel, loading }) {
    const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center p-2 z-50">
      <div className="bg-gray-900 border border-gray-700 w-full max-w-md p-6 rounded shadow-lg">
        <h2 className="text-xl mb-4">{message}</h2>
        <div className="flex justify-end space-x-4">
          <button
            className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
            onClick={onCancel}
            disabled={loading}
          >
            {t('cancel')}
          </button>
          <button
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
            onClick={onConfirm}
            disabled={loading}
          >
            {t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
