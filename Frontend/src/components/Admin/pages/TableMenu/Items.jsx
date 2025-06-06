import { useState, useEffect, useContext } from "react";
import { TiMinus } from "react-icons/ti";
import { FaPlus } from "react-icons/fa";
import { LoginContext } from '../../../ContextProvider/Context';
import { CustomerContext } from '../../../ContextProvider/CustomerContext';

import axios from "axios";
import img from "../../../../assets/defaultImg.png";
import io from "socket.io-client";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { playClickSound } from '../../../ClickSound/click';
import { LuSearch } from 'react-icons/lu';
import { MdShoppingCart } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

export default function Items({ selectedCategory, searchQuery, userRole, onCartClick }) {
  const { loginData } = useContext(LoginContext);
  const AdminId = userRole === "admin"
    ? loginData?.validUser?._id
    : loginData?.validUser?.AdminId;
  const { ipAddress } = useContext(CustomerContext);
  const { t } = useTranslation();

  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [instruction, setInstruction] = useState("");
  const [form, setForm] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [allUnits, setAllUnits] = useState([]);
  const [itemCount, setItemCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const CustomerId = localStorage.getItem("TableId");
  const tableId = localStorage.getItem("TableId");

  const fetchData = async () => {
    try {
      const productResponse = await axios.get(`${API_URL}/api/products/${AdminId}`);
      const activeProducts = productResponse.data.products.filter(p => p.status === "Active");
      setProducts(activeProducts);

      const initialQuantities = {};
      activeProducts.forEach(p => { initialQuantities[p._id] = 1; });
      setQuantities(initialQuantities);
    } catch (err) {}
  };

  const fetchUnits = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/units/${AdminId}`);
      setAllUnits(response.data.units || []);
    } catch (err) {}
  };

  useEffect(() => {
    if (AdminId) {
      fetchData();
      fetchUnits();
    }
  }, [AdminId]);

  useEffect(() => {
    socket.on("productAdded", fetchData);
    socket.on("productUpdated", fetchData);
    socket.on("productDeleted", fetchData);
    return () => {
      socket.off("productAdded", fetchData);
      socket.off("productUpdated", fetchData);
      socket.off("productDeleted", fetchData);
    };
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchInput.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleIncrease = (productId) => {
    setQuantities((prev) => ({ ...prev, [productId]: prev[productId] + 1 }));
  };

  const handleDecrease = (productId) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: prev[productId] > 1 ? prev[productId] - 1 : 1,
    }));
  };

  const handleCancel = () => {
    setForm(false);
    setSelectedFood(null);
    setSelectedSize("");
    setSelectedPrice(0);
    setInstruction("");
  };

  const getUnitName = (unitId) => {
    const unit = allUnits.find((u) => u._id === unitId);
    return unit ? unit.name : "Unknown Size";
  };

  const handleAddSelectedItems = async () => {
    try {
      const selectedUnit = selectedFood.units.find((unit) => unit._id === selectedSize);
      if (!selectedUnit) {
        toast.error("Please select a valid size.");
        return;
      }

      const selectedItem = {
        name: selectedFood.name,
        category: selectedFood.category,
        size: getUnitName(selectedUnit.size),
        quantity: quantities[selectedFood._id],
        price: selectedUnit.price,
        instructions: instruction,
        image: selectedFood.image,
      };

      await axios.post(`${API_URL}/api/add-selected-items`, {
        AdminId,
        tableId,
        CustomerId,
        selectedItems: [selectedItem],
        ipAddress,
      });

      setQuantities((prev) => ({ ...prev, [selectedFood._id]: 1 }));
      setForm(false);
      setSelectedFood(null);
      setSelectedSize("");
      setSelectedPrice(0);
      setInstruction("");
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const updateCart = async () => {
    try {
      const cartResponse = await axios.get(`${API_URL}/api/selected-items/${AdminId}/${tableId}/${CustomerId}`);
      const selectedItems = cartResponse.data.selectedItemsEntry?.selectedItems || [];

      if(selectedItems.length === 0){
        setItemCount(0);
        setTotalAmount(0);
        return;
      }

      setItemCount(selectedItems.length);
      const total = selectedItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
      setTotalAmount(total);
    } catch (error) {}
  };

  useEffect(() => {
    if (AdminId != null && tableId != null) {
      updateCart();
    }
  }, [AdminId, tableId]);

  useEffect(() => {
    const resetCart = () => {
      setItemCount(0);
      setTotalAmount(0);
    };

    const events = ['ItemsAdded', 'ItemsUpdated', 'ItemsDeleted', 'ItemsQtyUpdated', 'ItemsDeletedAll'];
    events.forEach(event => {
      if(event === 'ItemsDeletedAll') {
        socket.on(event, resetCart);
      } else {
        socket.on(event, updateCart);
      }
    });

    return () => {
      events.forEach(event => {
        if(event === 'ItemsDeletedAll') {
          socket.off(event, resetCart);
        } else {
          socket.off(event, updateCart);
        }
      });
    };
  }, [AdminId, tableId]);

  return (
    <div className="flex flex-col h-full border-r border-gray-700">
      {/* Fixed Search & Cart Header */}
      <div className="sticky top-0 z-10 bg-gray-900 p-1.5 flex justify-between items-center space-x-4">
        <div className="relative w-full max-w-xs md:max-w-md">
          <LuSearch className="absolute inset-y-0 left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 md:w-5 md:h-5" />
          <input
            type="text"
            className="block w-full p-2 pl-10 text-sm text-gray-500 border border-gray-700 bg-gray-900 rounded-lg outline-none"
            placeholder={t('searchYourFood')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="md:hidden flex items-center space-x-2 cursor-pointer">
          <label className="text-white">{totalAmount.toFixed(2)}</label>
          <div
            className="relative"
            onClick={() => {
              if (onCartClick) onCartClick(); // call toggle
            }}
          >
            <label className="absolute -top-1 -right-1 text-xs text-white bg-green-700 rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount}
            </label>
            <MdShoppingCart className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Scrollable Product Grid */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredProducts.length === 0 ? (
          <div className="text-center text-gray-500">{t('noItemsFound')}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {filteredProducts.map((product) => (
              <div key={product._id} className="shadow-xl bg-gray-800 pb-1 rounded-md">
                {/* Product Card */}
                <div className="rounded-md flex flex-col">
                  <div className="relative w-full h-30">
                    <img
                      src={`${API_URL}/${product.image || img}`}
                      className="w-full h-[12vh] rounded-t-md object-cover"
                      alt={product.name}
                    />
                    <h1 className="absolute bottom-0 left-0 w-full text-center text-white bg-black bg-opacity-50 py-2">
                      {product.name}
                    </h1>
                  </div>

                  <div className="flex items-center justify-center gap-3 my-2">
                    <div
                      className="p-1 bg-black bg-opacity-50 text-white cursor-pointer"
                      onClick={() => {
                        playClickSound();
                        handleDecrease(product._id);
                      }}
                    >
                      <TiMinus />
                    </div>
                    <p>{quantities[product._id]}</p>
                    <div
                      className="p-1 bg-black bg-opacity-50 text-white cursor-pointer"
                      onClick={() => {
                        playClickSound();
                        handleIncrease(product._id);
                      }}
                    >
                      <FaPlus />
                    </div>
                  </div>

                  <div
                    className="p-2 bg-gray-950 text-center text-slate-300 cursor-pointer"
                    onClick={() => {
                      playClickSound();
                      setSelectedFood(product);
                      setForm(true);
                      setSelectedSize("");
                      setSelectedPrice(0);
                    }}
                  >
                    <button>{t('selected')}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {form && selectedFood && (
        <div className="fixed inset-0 flex justify-center items-center h-screen bg-black bg-opacity-50 z-50">
          <div className="p-4 bg-gray-800 rounded-md space-y-4 w-full max-w-md mx-2">
            <div className="p-2 shadow-lg">
              <h1 className="text-center text-xl">{selectedFood.name}</h1>
            </div>
            <img
              src={`${API_URL}/${selectedFood.image || img}`}
              className="w-full h-48 rounded-md object-cover"
              alt={selectedFood.name}
            />
            <div className="flex justify-between items-center">
              <div className="flex justify-between items-center">
                <label>{t('qty')} -</label>
                <span>{quantities[selectedFood._id]}</span>
              </div>
              <div className="flex justify-between items-center">
                <select
                  value={selectedSize}
                  onChange={(e) => {
                    const size = e.target.value;
                    const unit = selectedFood.units.find((unit) => unit._id === size);
                    setSelectedSize(size);
                    setSelectedPrice(unit ? unit.price : 0);
                  }}
                  className="p-2 w-full bg-gray-800 border border-gray-900 outline-none cursor-pointer"
                  required
                >
                  <option value="">{t('selectSize')}</option>
                  {selectedFood.units.map((unit) => (
                    <option key={unit._id} value={unit._id}>
                      {getUnitName(unit.size)} - Rs {unit.price}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <label>{t('total')}</label>
              <span>Rs {(quantities[selectedFood._id] * selectedPrice).toFixed(2)}</span>
            </div>
            <textarea
              className="p-2 w-full bg-gray-800 border border-gray-900"
              placeholder={t('specialInstruction')}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
            />
            <div className="flex space-x-2">
              <button className="w-full bg-gray-700 p-2" onClick={() => { handleCancel(); playClickSound(); }}>
                {t('cancel')}
              </button>
              <button
                className={`w-full p-2 text-white ${!selectedSize ? "bg-gray-500" : "bg-green-700"}`}
                onClick={() => { handleAddSelectedItems(); playClickSound(); }}
                disabled={!selectedSize}
              >
                {t('add')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={2000} hideProgressBar={false} />
    </div>
  );
}
