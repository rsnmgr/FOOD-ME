import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { FaPlus } from "react-icons/fa";
import { LuSearch } from "react-icons/lu";
import { LoginContext } from "../../../ContextProvider/Context";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;

export default function MenuCategory() {
    const { t} = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryData, setCategoryData] = useState({
    name: "",
    status: "Active",
  });

  const { loginData } = useContext(LoginContext);
  const AdminId = loginData?.validUser?._id;

  useEffect(() => {
    if (AdminId) {
      fetchCategories();
    } else {
      toast.warn("Admin ID is not available.");
    }
  }, [AdminId]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/categories/${AdminId}`);
      setCategories(response.data.categories || []);
    } catch (error) {
      const message =
        error.response?.data?.message || "Error fetching categories.";
      toast.error(message);
    }
  };

  const handleToggleModal = () => {
    setShowModal((prev) => !prev);
    if (!showModal) {
      setCategoryData({ name: "", status: "Active" });
      setSelectedCategory(null);
    }
  };

  const handleEditClick = async (categoryId) => {
    if (!AdminId) {
      toast.warn("Admin ID is not available.");
      return;
    }
    try {
      const response = await axios.get(
        `${API_URL}/api/category/${AdminId}/${categoryId}`
      );
      setCategoryData(response.data.category || { name: "", status: "Active" });
      setSelectedCategory(categoryId);
      setShowModal(true);
    } catch (error) {
      const message =
        error.response?.data?.message || "Error fetching category.";
      toast.error(message);
    }
  };

  const handleDeleteClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!AdminId || !selectedCategory) {
      toast.warn("Admin ID or selected category is not available.");
      return;
    }
    try {
      const response = await axios.delete(
        `${API_URL}/api/category/${AdminId}/${selectedCategory}`
      );
      setCategories((prevCategories) =>
        prevCategories.filter((category) => category._id !== selectedCategory)
      );
      setShowDeleteConfirm(false);
      setSelectedCategory(null);
      // toast.success(response.data.message);
      toast.success(t('categoryDeleted'));
    } catch (error) {
      // const message =
      //   error.response?.data?.message || "Error deleting category.";
      // toast.error(message);
      toast.error(t('categoryAssigned'));
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setSelectedCategory(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!AdminId) {
      toast.warn("Admin ID is not available.");
      return;
    }
    try {
      let response;
      if (selectedCategory) {
        response = await axios.put(
          `${API_URL}/api/category/${AdminId}/${selectedCategory}`,
          categoryData
        );
        toast.success(t('categoryUpdated'));
      } else {
        response = await axios.post(`${API_URL}/api/category`, {
          AdminId,
          ...categoryData,
        });
        toast.success(t('categoryAdded'));
      }
      // toast.success(response.data.message);
      fetchCategories();
      handleToggleModal();
    } catch (error) {
      // const message =
      //   error.response?.data?.message || "Error saving category.";
      // toast.error(message);
      toast.error(t('categoryExists'));
    }
  };

  const filteredCategories = categories.filter((category) =>
    category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full p-3 bg-gray-950">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <div className="relative w-full max-w-xs">
          <LuSearch className="absolute inset-y-0 left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 w-5 h-5" />
          <input
            type="text"
            className="block w-[70%] p-3 pl-10 text-slate-200 bg-gray-900 bg-opacity-80 text-sm border border-gray-800 outline-none rounded-lg"
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className="p-2 bg-gray-900 text-white w-auto border border-gray-800 ml-2"
          title="Category Add"
          onClick={handleToggleModal}
        >
          <FaPlus />
        </button>
      </div>

      {/* Table container fills remaining space */}
      <div className="flex-1 overflow-y-auto bg-gray-900 rounded-lg border border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-800 sticky top-0 z-10">
            <tr>
              {["sn", "name", "status", "action"].map((header) => (
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
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category, index) => (
                <tr key={category._id} className="text-slate-200">
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                    {category.status}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm flex justify-center gap-4">
                    <MdModeEdit
                      className="text-2xl text-green-800 cursor-pointer"
                      title="Edit"
                      onClick={() => handleEditClick(category._id)}
                    />
                    <MdDelete
                      title="Delete"
                      className="text-2xl text-red-800 cursor-pointer"
                      onClick={() => handleDeleteClick(category._id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-4 text-center text-slate-200 text-sm"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-950 bg-opacity-70 z-50 p-4">
          <div className="relative p-8 bg-gray-900 border border-gray-800 rounded-lg shadow-md max-w-md w-full max-h-full overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-semibold text-white">
                {selectedCategory ? t('edit_category') : t('add_category')}
              </h1>
              <RxCross2
                size={25}
                className="cursor-pointer text-white"
                onClick={handleToggleModal}
              />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-white mb-1">
                    {t('name')} <span className="text-red-500"> *</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={categoryData.name}
                      onChange={handleInputChange}
                      className="block p-2 bg-gray-900 px-3 border border-gray-700 outline-none w-full text-white"
                      required
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-white mb-1">
                      {t('status')} <span className="text-red-500"> *</span>
                    </label>
                    <select
                      name="status"
                      value={categoryData.status}
                      onChange={handleInputChange}
                      className="block p-1 bg-gray-900 px-3 border border-gray-700 outline-none w-full"
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="p-2 bg-gray-800 text-white w-full"
                  >
                    {t('submit')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-950 bg-opacity-70 z-50 p-4">
          <div className="relative p-8 bg-gray-900 border border-gray-800 rounded-lg shadow-md max-w-md w-full max-h-full overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-semibold text-white">
                {t('confirmDeletion')}
              </h1>
              <RxCross2
                size={25}
                className="cursor-pointer text-white"
                onClick={handleDeleteCancel}
              />
            </div>
            <p className="text-white mb-4">
              {t('deleteConfirm',{ item: t('category') })}
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleDeleteConfirm}
                className="p-2 px-3 rounded-sm bg-red-800 text-white w-auto"
              >
                {t('delete')}
              </button>
              <button
                onClick={handleDeleteCancel}
                className="p-2 px-3 rounded-sm bg-gray-800 text-white w-auto"
              >
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
