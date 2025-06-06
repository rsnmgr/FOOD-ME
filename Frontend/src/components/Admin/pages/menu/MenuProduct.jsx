import { useState, useRef, useEffect, useContext } from "react";
import axios from "axios";
import image from "../.././../../assets/defaultImg.png";
import { LoginContext } from "../../../ContextProvider/Context";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductForm from "./product/ProductForm";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { LuSearch } from "react-icons/lu";
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;

export default function Items() {
  const { t} = useTranslation();
  const { loginData } = useContext(LoginContext);
  const AdminId = loginData?.validUser?._id;

  // States
  const [details, setDetails] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [categoryNames, setCategoryNames] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    units: [],
    discount: "",
    status: "Active",
  });
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedImage, setSelectedImage] = useState(image);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch data on load or AdminId change
  useEffect(() => {
    if (AdminId) {
      fetchDetails();
      fetchCategories();
      fetchUnits();
    }
  }, [AdminId]);

  // Fetch products
  const fetchDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products/${AdminId}`);
      setDetails(response.data.products);
    } catch (error) {
      toast.error("Error fetching products.");
    }
  };

  // Fetch categories and create ID-to-name map
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/categories/${AdminId}`);
      const categoriesData = response.data.categories;
      setCategories(categoriesData);

      const categoryMap = categoriesData.reduce((acc, category) => {
        acc[category._id] = category.name;
        return acc;
      }, {});
      setCategoryNames(categoryMap);
    } catch (error) {
      toast.error("Error fetching categories.");
    }
  };

  // Fetch units
  const fetchUnits = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/units/${AdminId}`);
      setUnits(response.data.units || []);
    } catch (error) {
      toast.error("Error fetching units.");
    }
  };

  // Open modal for add or edit
  const handleToggleModal = (detail = null) => {
    if (detail) {
      setSelectedDetail(detail);
      setFormData({
        name: detail.name || "",
        category: detail.category || (categories[0]?._id || ""),
        units: detail.units ?? [],
        discount: detail.discount || "",
        status: detail.status || "Active",
      });
      setSelectedImage(detail.image ? `${API_URL}/${detail.image}` : image);
    } else {
      setSelectedDetail(null);
      setFormData({
        name: "",
        category: categories[0]?._id || "",
        units: [],
        discount: "",
        status: "Active",
      });
      setSelectedImage(image);
    }
    setShowModal(!showModal);
  };

  // Delete modal cancel
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setSelectedDetail(null);
  };

  // Delete product confirmation
  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${API_URL}/api/products/${AdminId}/${selectedDetail._id}`);
      // toast.success("Product deleted successfully.");
      toast.success(t('productDeleted'));
      fetchDetails();
    } catch (error) {
      toast.error("Error deleting product.");
    } finally {
      setShowDeleteConfirm(false);
      setSelectedDetail(null);
    }
  };

  // Form submit handler for add or update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "units") {
        data.append(key, JSON.stringify(value || []));
      } else {
        data.append(key, value);
      }
    });

    if (fileInputRef.current?.files[0]) {
      data.append("image", fileInputRef.current.files[0]);
    }

    data.append("AdminId", AdminId);

    try {
      if (selectedDetail) {
        await axios.put(`${API_URL}/api/products/${AdminId}/${selectedDetail._id}`, data);
        // toast.success("Product updated successfully.");
        toast.success(t('productUpdated'));
      } else {
        await axios.post(`${API_URL}/api/products`, data);
        // toast.success("Product added successfully.");
        toast.success(t('productAdded'));
      }
      fetchDetails();
      handleToggleModal(); // Close modal after submit
    } catch (error) {
      // toast.error("Error submitting product.");
      toast.error(t('productExists'));
    }
  };

  // Image preview update on file select
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  // Filter details by search term (case-insensitive)
  const filteredDetails = details.filter((detail) =>
    detail.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full p-3">
      {/* Search bar and Add button */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-xs">
          <LuSearch className="absolute inset-y-0 left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
          <input
            type="text"
            className="block w-[70%] p-3 pl-10 text-slate-200 bg-gray-900 text-sm border border-gray-800 outline-none rounded-lg"
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          className="p-2 bg-gray-900 text-white border border-gray-800"
          title="Add Product"
          onClick={() => handleToggleModal()}
        >
          <FaPlus />
        </button>
      </div>

      {/* Products table */}
      <div className="flex-1 overflow-y-auto rounded-md">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-800 sticky top-0 z-10">
            <tr>
              {["sn", "name", "category", "units", "image", "status", "action"].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-center text-sm font-medium uppercase tracking-wider text-gray-100"
                >
                  {t(header)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {filteredDetails.length > 0 ? (
              filteredDetails.map((detail, index) => (
                <tr key={detail._id} className="text-slate-200">
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{index + 1}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{detail.name}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                    {categoryNames[detail.category] || "Loading..."}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                    {detail.units?.length > 0
                      ? detail.units
                          .map((unit) => {
                            const matchedUnit = units.find((u) => u._id === unit.size);
                            return matchedUnit ? matchedUnit.name : "Unknown Unit";
                          })
                          .join(", ")
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                    <img
                      src={`${API_URL}/${detail.image}`}
                      alt="Product"
                      className="w-8 h-8 rounded-md object-cover mx-auto"
                    />
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{detail.status}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm flex justify-center gap-2">
                    <MdModeEdit
                      className="text-2xl text-green-800 cursor-pointer"
                      title="Edit"
                      onClick={() => handleToggleModal(detail)}
                    />
                    <MdDelete
                      className="text-2xl text-red-800 cursor-pointer"
                      title="Delete"
                      onClick={() => {
                        setSelectedDetail(detail);
                        setShowDeleteConfirm(true);
                      }}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-100">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Product Form Modal */}
      {showModal && (
        <ProductForm
          selectedDetail={selectedDetail}
          handleSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          handleImageChange={handleImageChange}
          handleChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
          categories={categories}
          selectedImage={selectedImage}
          fileInputRef={fileInputRef}
          handleToggleModal={handleToggleModal}
          units={units}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-950 bg-opacity-50 z-50">
          <div className="relative p-8 bg-gray-900 border border-gray-800 rounded-lg shadow-md max-w-sm w-full">
            <h1 className="text-lg font-semibold text-white mb-6">
             {t('deleteConfirm', { item: t('product') })}
            </h1>
            <div className="flex justify-end space-x-4">
              <button onClick={handleDeleteConfirm} className="bg-red-600 text-white p-2">
                {t('delete')}
              </button>
              <button onClick={handleDeleteCancel} className="bg-gray-600 text-white p-2">
               {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" />
    </div>
  );
}
