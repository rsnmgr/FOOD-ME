import { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { MdDelete, MdModeEdit } from 'react-icons/md';
import { RxCross2 } from 'react-icons/rx';
import { FaPlus } from 'react-icons/fa';
import { LuSearch } from 'react-icons/lu';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import image from '../../../../assets/defaultImg.png';
import { LoginContext } from "../../../ContextProvider/Context";
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;

export default function Purchase() {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [selectedImage, setSelectedImage] = useState(image);
  const [formData, setFormData] = useState({
    supplierName: '',
    itemName: '',
    quantity: '',
    pricePerUnit: '',
    totalPrice: '',
    paymentStatus: 'Pending',
    dateOfPurchase: ''
  });
  const [purchases, setPurchases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { loginData } = useContext(LoginContext);
  const AdminId = loginData?.validUser?._id;
  const { t } = useTranslation();

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (AdminId) fetchPurchases();
  }, [AdminId]);

  const fetchPurchases = async () => {
    try {
      if (!AdminId) return;
      const response = await axios.get(`${API_URL}/api/purchases/${AdminId}`);
      setPurchases(response.data.purchases);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const handleToggleModal = (purchase = null) => {
    setShowModal(!showModal);
    if (purchase) {
      setFormData({
        supplierName: purchase.supplierName,
        itemName: purchase.itemName,
        quantity: purchase.quantity,
        pricePerUnit: purchase.pricePerUnit,
        totalPrice: purchase.totalPrice,
        paymentStatus: purchase.paymentStatus,
        dateOfPurchase: purchase.dateOfPurchase.slice(0, 10)
      });
      setSelectedImage(`${API_URL}/${purchase.image}`);
      setSelectedPurchase(purchase);
    } else {
      setFormData({
        supplierName: '',
        itemName: '',
        quantity: '',
        pricePerUnit: '',
        totalPrice: '',
        paymentStatus: 'Pending',
        dateOfPurchase: ''
      });
      setSelectedImage(image);
      setSelectedPurchase(null);
    }
  };

  const handleDeleteClick = (purchase) => {
    setSelectedPurchase(purchase);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${API_URL}/api/purchases/${AdminId}/${selectedPurchase._id}`);
      fetchPurchases();
      setShowDeleteConfirm(false);
      setSelectedPurchase(null);
      toast.success(t('purchaseDeleted'));
    } catch (error) {
      console.error('Error deleting purchase:', error);
      toast.error('Failed to delete purchase.');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setSelectedPurchase(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      if (name === 'quantity' || name === 'pricePerUnit') {
        const quantity = parseFloat(updatedData.quantity) || 0;
        const pricePerUnit = parseFloat(updatedData.pricePerUnit) || 0;
        updatedData.totalPrice = (quantity * pricePerUnit).toFixed(2);
      }
      return updatedData;
    });
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
      if (selectedPurchase) {
        await axios.put(`${API_URL}/api/purchases/${AdminId}/${selectedPurchase._id}`, data);
        toast.success(t('purchaseUpdated'));
      } else {
        await axios.post(`${API_URL}/api/purchases`, data);
        toast.success(t('purchaseAdded'));
      }
      fetchPurchases();
      handleToggleModal();
    } catch (error) {
      console.error('Error submitting purchase:', error);
      toast.error('Failed to submit purchase.');
    }
  };

  const calculateTotalPurchaseAmount = () =>
    purchases.reduce((total, purchase) => total + parseFloat(purchase.totalPrice || 0), 0).toFixed(2);

  useEffect(() => {
    return () => {
      if (selectedImage !== image) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  return (
    <div className='flex flex-col h-full p-3'>
      <ToastContainer position="bottom-right" />

      {/* Header */}
      <div className='flex justify-between items-center mb-4'>
        <div className="relative w-full max-w-xs">
          <LuSearch className="absolute inset-y-0 left-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none text-gray-500 w-5 h-5" />
          <input
            type="text"
            className="block w-[70%] p-3 pl-10 text-slate-200 bg-gray-900 text-sm border border-gray-700 rounded-lg outline-none"
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className='p-2 bg-gray-800 text-white border border-gray-700 w-auto'
          title='Add Purchase'
          onClick={() => handleToggleModal()}
        >
          <FaPlus />
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto rounded-md">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-800 sticky top-0 z-10">
            <tr>
              {[
                { short: 'sn', full: 'Serial Number' },
                { short: 'name', full: 'Supplier Name' },
                { short: 'items', full: 'Item Name' },
                { short: 'qty', full: 'Quantity' },
                { short: 'unit', full: 'Price Per Unit' },
                { short: 'total', full: 'Total Price' },
                { short: 'image', full: 'Image' },
                { short: 'status', full: 'Status' },
                { short: 'date', full: 'Date of Purchase' },
                { short: 'action', full: 'Actions' }
              ].map(({ short, full }) => (
                <th
                  key={short}
                  className="px-6 py-3 text-center text-sm font-medium uppercase tracking-wider text-gray-100"
                  title={full}
                >
                  {t(short)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {purchases.filter(purchase => purchase.itemName.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
              purchases.filter(purchase => purchase.itemName.toLowerCase().includes(searchTerm.toLowerCase())).map((purchase, index) => (
                <tr key={purchase._id} className="text-slate-200">
                  <td className="px-6 py-4 text-center text-sm">{index + 1}</td>
                  <td className="px-6 py-4 text-center text-sm">{purchase.supplierName}</td>
                  <td className="px-6 py-4 text-center text-sm">{purchase.itemName}</td>
                  <td className="px-6 py-4 text-center text-sm">{purchase.quantity}</td>
                  <td className="px-6 py-4 text-center text-sm">{purchase.pricePerUnit}</td>
                  <td className="px-6 py-4 text-center text-sm">{purchase.totalPrice}</td>
                  <td className="px-6 py-4 text-center text-sm">
                    <img
                      src={`${API_URL}/${purchase.image}` || image}
                      alt="Purchase"
                      className="w-8 h-8 rounded-md object-cover mx-auto"
                    />
                  </td>
                  <td className="px-6 py-4 text-center text-sm">{purchase.paymentStatus}</td>
                  <td className="px-6 py-4 text-center text-sm">{purchase.dateOfPurchase.slice(0, 10)}</td>
                  <td className="px-6 py-4 text-center text-sm flex justify-center gap-2">
                    <MdModeEdit
                      className="text-2xl text-green-800 cursor-pointer"
                      title='Edit'
                      onClick={() => handleToggleModal(purchase)}
                    />
                    <MdDelete
                      title='Delete'
                      className="text-2xl text-red-800 cursor-pointer"
                      onClick={() => handleDeleteClick(purchase)}
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

      {/* Total */}
      <div className='flex justify-between items-center pt-2'>
        <h1 className="text-white">{t('totalPurchaseAmount')}</h1>
        <span>{calculateTotalPurchaseAmount()}</span>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-950 bg-opacity-50 z-50">
          <div className="relative p-8 bg-gray-900 border border-gray-800 rounded-lg shadow-md max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-semibold text-white">
                {selectedPurchase ? t('editPurchase') : t('addPurchase')}
              </h1>
              <RxCross2 size={25} className="cursor-pointer text-white" onClick={() => handleToggleModal()} />
            </div>
            <div className='overflow-y-auto max-h-[70vh]'>
              <form className='mt-4' onSubmit={handleSubmit}>
                <div className='grid md:grid-cols-2 gap-4'>
                  <div className='space-y-1'>
                    {['supplierName', 'itemName', 'quantity', 'pricePerUnit', 'dateOfPurchase'].map((field) => (
                      <div key={field} className='relative'>
                        <label className='block text-sm font-medium text-white mb-1 capitalize'>
                          {t(field)}
                        </label>
                        <input
                          type={field === 'dateOfPurchase' ? 'date' : 'text'}
                          name={field}
                          value={formData[field]}
                          onChange={handleChange}
                          className='block p-1 bg-gray-900 px-3 border border-gray-700 outline-none w-full'
                          required
                        />
                      </div>
                    ))}

                    <div className='relative'>
                      <label className='block text-sm font-medium text-white mb-1'>{t('status')}</label>
                      <select
                        name="paymentStatus"
                        value={formData.paymentStatus}
                        onChange={handleChange}
                        className='block p-1 bg-gray-900 px-3 border border-gray-700 outline-none w-full'
                        required
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </div>

                    <div className='relative'>
                      <label className='block text-sm font-medium text-white mb-1'>{t('total_price')}</label>
                      <input
                        type="text"
                        name="totalPrice"
                        value={formData.totalPrice}
                        readOnly
                        className='block p-1 bg-gray-900 px-3 border border-gray-700 outline-none w-full'
                      />
                    </div>
                  </div>

                  <div className='space-y-4'>
                    {selectedImage && (
                      <img src={selectedImage} alt="Selected" className='object-cover w-full h-[37vh] rounded-md' />
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
                      className='p-2 bg-green-800 text-white w-full'
                    >
                      {t('browseImage')}
                    </button>
                    <button type="submit" className='p-2 bg-gray-800 text-white w-full'>
                      {selectedPurchase ? t('update') : t('submit')}
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
          <div className="relative p-8 bg-gray-900 border border-gray-800 rounded-lg shadow-md max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-semibold text-white">{t('confirmDeletion')}</h1>
              <RxCross2 size={25} className="cursor-pointer text-white" onClick={handleDeleteCancel} />
            </div>
            <p className="text-white mb-4">
              {t('confirmDeletePurchase', { itemName: selectedPurchase?.itemName || '' })}?
            </p>
            <div className="flex justify-end gap-4">
              <button onClick={handleDeleteConfirm} className="p-1 bg-red-800 text-white w-auto">
                {t('delete')}
              </button>
              <button onClick={handleDeleteCancel} className="p-1 bg-gray-800 text-white w-auto">
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
