import { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { MdDelete, MdModeEdit } from 'react-icons/md';
import { RxCross2 } from 'react-icons/rx';
import { FaPlus } from 'react-icons/fa';
import { LuSearch } from 'react-icons/lu'; 
import image from '../../../../assets/defaultImg.png';
import { LoginContext } from "../../../ContextProvider/Context";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;

export default function StaffDetails() {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedImage, setSelectedImage] = useState(image);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    category: '',
    address: '',
    phone: '',
    salary: '',
    status: 'Active'
  });
  const [details, setDetails] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { loginData } = useContext(LoginContext);
  const AdminId = loginData?.validUser?._id;
  const fileInputRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (AdminId) {
      fetchDetails();
    }
  }, [AdminId]);

  const fetchDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/details/${AdminId}`);
      setDetails(response.data.details);
    } catch (error) {
      console.error('Error fetching details:', error);
    }
  };

  const handleToggleModal = (detail = null) => {
    setShowModal(!showModal);
    if (detail) {
      setFormData({
        name: detail.name,
        email: detail.email,
        password: detail.password,
        category: detail.category || '',
        address: detail.address,
        phone: detail.phone,
        salary: detail.salary,
        status: detail.status || 'Active'
      });
      setSelectedImage(`${API_URL}/${detail.image}`);
      setSelectedDetail(detail);
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        category: '',
        address: '',
        phone: '',
        salary: '',
        status: 'Active'
      });
      setSelectedImage(image);
      setSelectedDetail(null);
    }
  };

  const handleDeleteClick = (detail) => {
    setSelectedDetail(detail);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(`${API_URL}/api/details/${AdminId}/${selectedDetail._id}`);
      fetchDetails();
      setShowDeleteConfirm(false);
      setSelectedDetail(null);
      // toast.success(response.data.message || 'Detail deleted successfully.');
      toast.success(t('staffDeleted'))
    } catch (error) {
      console.error('Error deleting detail:', error);
      toast.error(error.response?.data?.message || 'Error deleting detail.');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setSelectedDetail(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    Object.keys(formData).forEach(key => data.append(key, formData[key]));

    if (fileInputRef.current.files[0]) {
      data.append('image', fileInputRef.current.files[0]);
    }

    data.append('AdminId', AdminId);

    try {
      if (selectedDetail) {
        const response = await axios.put(`${API_URL}/api/details/${AdminId}/${selectedDetail._id}`, data);
        // toast.success(response.data.message || 'Detail updated successfully.');
        toast.success(t('staffUpdated'));
      } else {
        const response = await axios.post(`${API_URL}/api/details`, data);
        // toast.success(response.data.message || 'Detail added successfully.');
        toast.success(t('staffAdded'));
      }
      fetchDetails();
      handleToggleModal();
    } catch (error) {
      console.error("Error submitting detail:", error.response?.data || error.message);
      // toast.error(error.response?.data?.message || 'Error submitting detail.');
      toast.error(t('emailExists'));
    }
  };

  useEffect(() => {
    return () => {
      if (selectedImage !== image) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  return (
    <div className='flex flex-col h-full p-3'>
      <div className='flex justify-between items-center mb-4'>
        <div className="relative w-full max-w-xs">
          <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            className="block w-[70%] p-3 pl-10 text-slate-200 bg-gray-900 text-sm border border-gray-700 outline-none rounded-lg"
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className='p-2 bg-gray-800 text-white border border-gray-700 w-auto'
          title='Detail Add'
          onClick={() => handleToggleModal()}
        >
          <FaPlus />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto rounded-md">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-800 sticky top-0 z-10">
            <tr>
              {['sn', 'name', 'Email', 'category', 'address', 'phone', 'salary', 'status', 'action'].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-center text-sm font-medium uppercase tracking-wider text-gray-100"
                >
                  {t(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-800">
            {details.filter(detail => detail.name.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
              details.filter(detail => detail.name.toLowerCase().includes(searchTerm.toLowerCase())).map((detail, index) => (
                <tr key={detail._id} className="text-slate-200">
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{index + 1}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{detail.name}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{detail.email}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{detail.category}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{detail.address}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{detail.phone}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{detail.salary}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{detail.status}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm flex justify-center gap-2">
                    <MdModeEdit
                      className="text-2xl text-green-700 cursor-pointer"
                      title='Edit'
                      onClick={() => handleToggleModal(detail)}
                    />
                    <MdDelete
                      title='Delete'
                      className="text-2xl text-red-600 cursor-pointer"
                      onClick={() => handleDeleteClick(detail)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="px-6 py-4 text-center text-sm text-gray-100">No data found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-950 bg-opacity-20 z-50">
          <div className="relative p-8 bg-gray-900 rounded-lg shadow-md max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-semibold text-white">{selectedDetail ? t('editDetails') : t('addDetails')}</h1>
              <RxCross2
                title='Close'
                size={25}
                className="cursor-pointer text-white"
                onClick={() => handleToggleModal()}
              />
            </div>
            <div className='overflow-y-auto max-h-[70vh]'>
              <form className='mt-4' onSubmit={handleSubmit}>
                <div className='grid md:grid-cols-2 gap-4'>
                  <div className='space-y-1'>
                    {['name','email','password', 'address', 'phone', 'salary'].map((field) => (
                      <div key={field} className='relative'>
                        <label className='block text-sm font-medium text-white mb-1 capitalize'>
                          {t(field)} <span className='text-red-500'> *</span>
                        </label>
                        <input
                          type={field === 'phone' ? 'tel' : field === 'salary' ? 'number' : 'text'}
                          name={field}
                          value={formData[field]}
                          onChange={handleChange}
                          className='block p-1 bg-gray-900 px-3 border border-gray-700 outline-none w-full'
                          required
                        />
                      </div>
                    ))}

                    <div className='relative'>
                      <label className='block text-sm font-medium text-white mb-1'>
                        {t('position')} <span className='text-red-500'> *</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className='block p-1 bg-gray-900 px-3 border border-gray-700 outline-none w-full'
                        required
                      >
                        <option value="">Select</option>
                        <option value="kitchen">kitchen</option>
                        <option value="waiter">waiter</option>
                      </select>
                    </div>

                    <div className='relative'>
                      <label className='block text-sm font-medium text-white mb-1'>
                        {t('status')} <span className='text-red-500'> *</span>
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className='block p-1 bg-gray-900 px-3 border border-gray-700 outline-none w-full'
                        required
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    {selectedImage && (
                      <img src={selectedImage} alt="Selected" className='object-cover w-full h-[44vh] rounded-md' />
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className='hidden'
                      accept="image/*"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className='p-2 bg-green-700 text-white w-full'
                    >
                      {t('browseImage')}
                    </button>
                    <button type="submit" className='p-2 bg-gray-700 text-white w-full'>
                      {selectedDetail ? t('update') : t('submit')}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-950 bg-opacity-50 z-50">
          <div className="relative p-8 bg-gray-900 rounded-lg shadow-md max-w-md w-full">
            <h1 className="text-xl font-semibold text-white mb-4">{t('confirmDeletion')}</h1>
            <p className="text-sm text-gray-400 mb-6">
              {t('confirmDeleteStaff')}
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="p-2 bg-gray-700 text-white"
                onClick={handleDeleteCancel}
              >
                {t('cancel')}
              </button>
              <button
                className="p-2 bg-red-600 text-white"
                onClick={handleDeleteConfirm}
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position='bottom-right' />
    </div>
  );
}
