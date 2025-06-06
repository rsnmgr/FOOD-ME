// import { useState, useContext, useEffect } from "react";
// import axios from "axios";
// import { MdDelete, MdModeEdit } from "react-icons/md";
// import { RxCross2 } from "react-icons/rx";
// import { FaPlus } from "react-icons/fa";
// import { LuSearch } from "react-icons/lu";
// import { LoginContext } from "../../../ContextProvider/Context";
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { useTranslation } from 'react-i18next';

// const API_URL = import.meta.env.VITE_API_URL;

// export default function StaffCategory() {
//   const [showModal, setShowModal] = useState(false);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [categories, setCategories] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isFormOpen, setIsFormOpen] = useState(false);
//   const [categoryData, setCategoryData] = useState({ name: "" });
//   const { t } = useTranslation();

//   const { loginData } = useContext(LoginContext);
//   const AdminId = loginData?.validUser?._id;

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const response = await axios.get(`${API_URL}/api/staff-category/${AdminId}`);
//         setCategories(response.data.categories);
//       } catch (error) {
//         console.error("Error fetching categories:", error);
//       }
//     };

//     fetchCategories();
//   }, [AdminId]);

//   const handleToggleModal = () => {
//     setShowModal(!showModal);
//     if (!showModal) {
//       setIsFormOpen(true);
//     }
//   };

//   const handleEditClick = async (categoryId) => {
//     try {
//       const response = await axios.get(`${API_URL}/api/staff-category/${AdminId}/${categoryId}`);
//       setCategoryData(response.data.category);
//       setSelectedCategory(categoryId);
//       setIsFormOpen(true);
//       setShowModal(true);
//     } catch (error) {
//       console.error("Error fetching category:", error);
//     }
//   };

//   const handleDeleteClick = (categoryId) => {
//     setSelectedCategory(categoryId);
//     setShowDeleteConfirm(true);
//   };

//   const handleDeleteConfirm = async () => {
//     try {
//       await axios.delete(`${API_URL}/api/staff-category/${AdminId}/${selectedCategory}`);
//       setCategories(categories.filter(category => category._id !== selectedCategory));
//       setShowDeleteConfirm(false);
//       setSelectedCategory(null);
//       toast.success("Category deleted successfully.");
//     } catch (error) {
//       toast.error("Error deleting category.");
//     }
//   };

//   const handleDeleteCancel = () => {
//     setShowDeleteConfirm(false);
//     setSelectedCategory(null);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setCategoryData({
//       ...categoryData,
//       [name]: value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const isDuplicate = categories.some(
//         (category) => category.name.toLowerCase() === categoryData.name.toLowerCase()
//       );

//       if (!selectedCategory && isDuplicate) {
//         toast.error("This category already exists.");
//         return;
//       }

//       if (selectedCategory) {
//         // Update category
//         const response = await axios.put(`${API_URL}/api/staff-category/${AdminId}/${selectedCategory}`, categoryData);
//         setCategories(categories.map(category =>
//           category._id === selectedCategory ? response.data.category : category
//         ));
//         toast.success("Category updated successfully.");
//       } else {
//         // Add new category
//         const response = await axios.post(`${API_URL}/api/staff-category`, {
//           AdminId,
//           ...categoryData,
//         });
//         setCategories([...categories, response.data.categoryEntry.category.pop()]);
//         toast.success("Category added successfully.");
//       }

//       setShowModal(false);
//       setCategoryData({ name: "" });
//       setSelectedCategory(null);
//     } catch (error) {
//       console.error("Error saving category:", error);
//       toast.error("Error saving category.");
//     }
//   };

//   const filteredCategories = categories.filter(category =>
//     category.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="flex flex-col h-full p-3">
//       <div className="flex justify-between items-center mb-4">
//         <div className="relative w-full max-w-xs">
//           <LuSearch className="absolute inset-y-0 left-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none text-gray-500 w-5 h-5" />
//           <input
//             type="text"
//             className="block w-[70%] p-3 pl-10 text-slate-200 bg-gray-900 text-sm border border-gray-700 outline-none rounded-lg"
//             placeholder={t('search')}
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//         <button
//           className="p-2 bg-gray-800 text-white w-auto border border-gray-700"
//           onClick={() => {
//             setCategoryData({ name: "" });
//             setIsFormOpen(true);
//             handleToggleModal();
//           }}
//         >
//           <FaPlus />
//         </button>
//       </div>

//       <div className="flex-1 overflow-y-auto rounded-md">
//         <div className="relative">
//           <table className="min-w-full divide-y divide-gray-200 bg-white">
//             <thead className="bg-gray-800 sticky top-0 z-10">
//               <tr>
//                 {["sn", "name", "action"].map(header => (
//                   <th
//                     key={header}
//                     className="px-6 py-3 text-center text-sm font-medium uppercase tracking-wider text-gray-100"
//                   >
//                     {t(header)}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="bg-gray-900 divide-y divide-gray-700">
//               {filteredCategories.length > 0 ? (
//                 filteredCategories.map((category, index) => (
//                   <tr key={category._id} className="text-slate-200">
//                     <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
//                       {index + 1}
//                     </td>
//                     <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
//                       {category.name}
//                     </td>
//                     <td className="px-6 py-4 text-center whitespace-nowrap text-sm flex justify-center gap-4">
//                       <MdModeEdit
//                         className="text-2xl text-green-700 cursor-pointer"
//                         title="Edit"
//                         onClick={() => handleEditClick(category._id)}
//                       />
//                       <MdDelete
//                         title="Delete"
//                         className="text-2xl text-red-500 cursor-pointer"
//                         onClick={() => handleDeleteClick(category._id)}
//                       />
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="3" className="px-6 py-4 text-center text-slate-200 text-sm">
//                     No data found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {showModal && (
//         <div className="fixed inset-0 flex justify-center items-center bg-gray-950 bg-opacity-20 z-50">
//           <div className="relative p-8 bg-gray-900 rounded-lg shadow-md max-w-md w-full">
//             <div className="flex justify-between items-center mb-6">
//               <h1 className="text-xl font-semibold text-white">{selectedCategory ? t('edit_category') : t('add_category')}</h1>
//               <RxCross2
//                 size={25}
//                 className="cursor-pointer text-white"
//                 onClick={handleToggleModal}
//               />
//             </div>

//             <form onSubmit={handleSubmit}>
//               <div className="space-y-4">
//                 <div className="grid grid-cols-1 gap-4">
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-white mb-1">
//                       {t('category')+" "+ t('name')} <span className='text-red-500'>*</span>
//                     </label>
//                     <select
//                       name="name"
//                       value={categoryData.name}
//                       onChange={handleInputChange}
//                       className="block p-2 bg-gray-900 px-3 border border-gray-700 outline-none w-full text-white"
//                       required
//                     >
//                       <option value="">{t('selectCategory')}</option>
//                       <option value="kitchen">Kitchen</option>
//                       <option value="waiter">Waiter</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div className="flex items-end">
//                   <button
//                     type="submit"
//                     className="p-2 bg-green-700 text-white w-full"
//                   >
//                     {t('submit')}
//                   </button>
//                 </div>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {showDeleteConfirm && (
//         <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
//           <div className="relative p-8 bg-gray-900 rounded-lg shadow-md max-w-md w-full">
//             <div className="flex justify-between items-center mb-4">
//               <h1 className="text-xl font-semibold text-white">
//                 Confirm Deletion
//               </h1>
//               <RxCross2
//                 size={25}
//                 className="cursor-pointer text-white"
//                 onClick={handleDeleteCancel}
//               />
//             </div>
//             <p className="text-white mb-4">
//               Are you sure you want to delete this category?
//             </p>
//             <div className="flex justify-end gap-4">
//               <button
//                 onClick={handleDeleteConfirm}
//                 className="p-2 bg-red-600 text-white w-auto"
//               >
//                 Delete
//               </button>
//               <button
//                 onClick={handleDeleteCancel}
//                 className="p-2 bg-gray-600 text-white w-auto"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//     <ToastContainer position="bottom-right" />
//     </div>
//   );
// }
