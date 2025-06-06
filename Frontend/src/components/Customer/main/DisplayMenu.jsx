import { useState, useEffect, useContext } from "react";
import { TiMinus } from "react-icons/ti";
import { FaPlus } from "react-icons/fa";
import { CustomerContext } from '../../ContextProvider/CustomerContext';
import axios from "axios";
import img from "../../../assets/defaultImg.png"; // Placeholder image
import io from "socket.io-client";
import { ToastContainer, toast } from 'react-toastify'; // Import toastify
import "react-toastify/dist/ReactToastify.css"; // Import toastify styles
import {playClickSound} from '../../ClickSound/click'
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

export default function DisplayMenu({ selectedCategory, searchQuery }) {
  const { customerData, AdminId, tableId,ipAddress } = useContext(CustomerContext);
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [instruction, setInstruction] = useState("");
  const [form, setForm] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedSize, setSelectedSize] = useState(""); // Initially an empty string
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [allUnits, setAllUnits] = useState([]); // State to store all units
  const CustomerId = customerData?.validUser?._id;
  const { t} = useTranslation('customer');

  // Fetch Product Data
  const fetchData = async () => {
    try {
      const productResponse = await axios.get(`${API_URL}/api/products/${AdminId}`);
      const activeProducts = productResponse.data.products.filter(
        (product) => product.status === "Active"
      );
      setProducts(activeProducts);

      const initialQuantities = {};
      activeProducts.forEach((product) => {
        initialQuantities[product._id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (err) {
      // console.error("Error fetching products:", err);
      // toast.error("Failed to fetch products"); // Show toast error
    }
  };

  // Fetch Units
  const fetchUnits = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/units/${AdminId}`);
      const unitsData = response.data.units || [];
      setAllUnits(unitsData); // Store all units
    } catch (error) {
      // console.error("Error fetching units.");
      // toast.error("Failed to fetch units"); // Show toast error
    }
  };

  useEffect(() => {
    if (AdminId) {
      fetchData();
      fetchUnits(); // Fetch units when AdminId changes
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
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleIncrease = (productId) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: prevQuantities[productId] + 1,
    }));
  };

  const handleDecrease = (productId) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: prevQuantities[productId] > 1 ? prevQuantities[productId] - 1 : 1,
    }));
  };

  const handleCancel = () => {
    setForm(false);
    setSelectedFood(null);
    setSelectedSize(""); // Reset size to empty string
    setSelectedPrice(0);
    setInstruction("");
  };

  // Get Unit Name by matching unit._id with product.units.size
  const getUnitName = (unitId) => {
    const unit = allUnits.find((unit) => unit._id === unitId);
    return unit ? unit.name : "Unknown Size";
  };

  const handleAddSelectedItems = async () => {
    try {
      // Find the selected unit based on the selected size (_id)
      const selectedUnit = selectedFood.units.find(
        (unit) => unit._id === selectedSize
      );

      if (!selectedUnit) {
        toast.error("Please select a valid size."); // Show toast error if no size selected
        return;
      }

      // Prepare the selected item with correct size name and price
      const selectedItem = {
        name: selectedFood.name,
        category: selectedFood.category,
        size: getUnitName(selectedUnit.size), // Get the size name using your helper function
        quantity: quantities[selectedFood._id],
        price: selectedUnit.price, // Use the price from the selected unit
        instructions: instruction,
        image: selectedFood.image,
      };

      // Add selected item to the cart
      const response = await axios.post(`${API_URL}/api/add-selected-items`, {
        AdminId,
        tableId,
        CustomerId,
        selectedItems: [selectedItem],
        ipAddress,
      });

      // Show toast success message
      // toast.success("Item added to cart successfully!");

      // Reset quantities and form after adding the item
      setQuantities((prevQuantities) => ({
        ...prevQuantities,
        [selectedFood._id]: 1,
      }));

      // Reset the form
      setForm(false);
      setSelectedFood(null);
      setSelectedSize(""); // Reset size
      setSelectedPrice(0);
      setInstruction("");
    } catch (error) {
  const errorMessage =
    error.response?.data?.message;
  toast.error(errorMessage);
}

  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-2">
      {filteredProducts.length === 0 ? (
        <div className="text-center text-gray-500">No items found</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 w-full">
          {filteredProducts.map((product) => (
            <div key={product._id} className="shadow-xl bg-gray-800 pb-1 rounded-md">
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
                    onClick={() => {playClickSound();handleDecrease(product._id)}}
                  >
                    <TiMinus />
                  </div>
                  <p>{quantities[product._id]}</p>
                  <div
                    className="p-1 bg-black bg-opacity-50 text-white cursor-pointer"
                    onClick={() => {playClickSound();handleIncrease(product._id)}}
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
                    setSelectedSize(""); // Set size to empty string
                    setSelectedPrice(0); // Reset price as well
                  }}
                >
                  <button>{t('home.select')}</button>
                  
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {form && selectedFood && (
        <div className="fixed inset-0 flex justify-center items-center h-screen bg-black bg-opacity-50">
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
                <label>{t('home.qty')} -</label>
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
                  <option value="">{t('home.selectSize')}</option>
                  {selectedFood.units.map((unit) => (
                    <option key={unit._id} value={unit._id} className="outline-node" onClick={playClickSound()}>
                      {getUnitName(unit.size)} - Rs {unit.price}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <label>{t('home.total')}</label>
              <span>
                Rs {(quantities[selectedFood._id] * selectedPrice).toFixed(2)}
              </span>
            </div>
            <textarea
              className="p-2 w-full bg-gray-800 border border-gray-900"
              placeholder={t('home.specialInstruction')}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
            />
            <div className="flex space-x-2">
              <button className="w-full bg-gray-700 p-2" onClick={()=>{handleCancel();playClickSound()}}>
                {t('home.cancel')}
              </button>
              <button
                className={`w-full p-2 text-white ${
                  !selectedSize ? "bg-gray-500" : "bg-green-700"
                }`}
                onClick={()=>{handleAddSelectedItems();playClickSound()}}
                disabled={!selectedSize} // Disable button if no size is selected
              >
                {t('home.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer /> {/* Add ToastContainer to your component */}
    </div>
  );
}
