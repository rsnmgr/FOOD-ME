// Table.jsx
import { useState, useEffect, useContext } from 'react';
import { FaEdit, FaTrash, FaPlus, FaQrcode } from 'react-icons/fa';
import { RxCross2 } from 'react-icons/rx';
import { LoginContext } from '../../ContextProvider/Context';
import axios from 'axios';
import QRCode from 'qrcode';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LuSearch } from "react-icons/lu";
import { useTranslation } from 'react-i18next';

const URL = import.meta.env.VITE_API_URL;

export default function Table() {
  const [form, setForm] = useState(false);
  const [deleteForm, setDeleteForm] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [tables, setTables] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { loginData } = useContext(LoginContext);
  const userId = loginData?.validUser?._id;
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [selectedTableName, setSelectedTableName] = useState('');
  const [inpVal, setInpVal] = useState({ name: '', status: 'Active' });
  const { t } = useTranslation();

  const API_URL = `${URL}/api/tables`;

  useEffect(() => {
    if (userId) fetchTables();
  }, [userId]);

  const fetchTables = async () => {
    try {
      const response = await axios.get(`${API_URL}/${userId}`);
      setTables(response.data.tables);
    } catch (error) {
      console.log(error.response?.data?.message || 'Error fetching tables');
    }
  };

  const handleInputChange = (e) => {
    setInpVal({ ...inpVal, [e.target.name]: e.target.value });
  };

  const openAddForm = () => {
    setInpVal({ name: '', status: 'Active' });
    setSelectedTableId(null);
    setForm(true);
  };

  const openEditForm = (table) => {
    setInpVal({ name: table.name, status: table.status });
    setSelectedTableId(table._id);
    setForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedTableId) {
      await updateTable(selectedTableId);
    } else {
      await addTable();
    }
    setForm(false);
    fetchTables();
  };

  const addTable = async () => {
    try {
      const response = await axios.post(API_URL, { AdminId: userId, ...inpVal });
      // toast.success(response.data.message);
      toast.success(t('tableAdded'));
    } catch (error) {
      // toast.error(error.response?.data?.message || 'Error adding table');
      toast.error(t('tableExists'));
    }
  };

  const updateTable = async (tableId) => {
    try {
      const response = await axios.put(`${API_URL}/${userId}/${tableId}`, inpVal);
      // toast.success(response.data.message);
      toast.success(t('tableUpdated'));
    } catch (error) {
      // toast.error(error.response?.data?.message || 'Error updating table');
      toast.error(t('tableExists'));
    }
  };

  const confirmDeleteTable = (tableId) => {
    setSelectedTableId(tableId);
    setDeleteForm(true);
  };

  const deleteTable = async () => {
    try {
      const response = await axios.delete(`${API_URL}/${userId}/${selectedTableId}`);
      // toast.success(response.data.message);
      toast.success(t('tableDeleted'));
      setDeleteForm(false);
      fetchTables();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting table');
    }
  };

  const generateQRCode = async (tableId, tableName) => {
    const url = `${window.location.origin}/info/${userId}/${tableId}`;
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(url);
      setQrCodeUrl(qrCodeDataUrl);
      setSelectedTableId(tableId);
      setSelectedTableName(tableName);
    } catch (error) {
      toast.error('Error generating QR code');
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${selectedTableName}.png`;
    link.click();
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/info/${userId}/${selectedTableId}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => toast.success(t('urlCopied')))
        .catch(() => toast.error('Failed to copy URL. Please try again.'));
    } else {
      try {
        const tempInput = document.createElement('input');
        tempInput.value = url;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        toast.success(t('urlCopied'));
      } catch {
        toast.error('Failed to copy URL. Please try again.');
      }
    }
  };

  const filteredTables = tables.filter((table) =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full p-3">
      {/* Search and Add */}
      <div className="flex justify-between items-center mb-2">
        <div className="relative w-full max-w-xs">
          <LuSearch className="absolute inset-y-0 left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
          <input
            type="text"
            className="block w-[70%] p-3 pl-10 text-slate-200 bg-gray-900 bg-opacity-80 text-sm border border-gray-800 outline-none rounded-lg"
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-2 bg-gray-800 border border-gray-700 rounded-sm" onClick={openAddForm}>
          <FaPlus />
        </button>
      </div>

      {/* Table container */}
      <div className="flex flex-col border border-gray-700 rounded-md flex-grow overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full text-sm text-center text-gray-50 border-collapse">
            <thead className="text-xs text-gray-50 uppercase bg-gray-800 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3">{t('sn')}</th>
                <th className="px-6 py-3">{t('table_name')}</th>
                <th className="px-6 py-3">{t('status')}</th>
                <th className="px-6 py-3">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700 border-t">
              {filteredTables.length ? (
                filteredTables.map((table, index) => (
                  <tr key={table._id} className="bg-gray-900 border-b border-gray-700">
                    <td className="px-4 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{table.name}</td>
                    <td className="px-6 py-4">{table.status}</td>
                    <td className="flex items-center justify-center px-6 py-4 space-x-4">
                      <button className="text-blue-600" onClick={() => openEditForm(table)}>
                        <FaEdit size={16} />
                      </button>
                      <button className="text-blue-600" onClick={() => generateQRCode(table._id, table.name)}>
                        <FaQrcode size={16} />
                      </button>
                      <button className="text-red-600" onClick={() => confirmDeleteTable(table._id)}>
                        <FaTrash size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 bg-gray-900">
                    {t('noTablesFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {form && (
        <div className="absolute inset-0 flex justify-center items-center bg-opacity-50 bg-gray-950 z-50">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-md">
            <form onSubmit={handleSubmit}>
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-lg">{selectedTableId ? t('editTable') : t('addTable')}</h1>
                <RxCross2 size={20} className="cursor-pointer" onClick={() => setForm(false)} />
              </div>
              <div className="space-y-4">
                <div>
                  <label>{t("table_name")}</label>
                  <input
                    type="text"
                    name="name"
                    value={inpVal.name}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-sm bg-gray-900 border border-gray-800"
                    required
                    maxLength={3}
                  />
                </div>
                
                <div>
                  <label>{t('status')}</label>
                  <select
                    name="status"
                    value={inpVal.status}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-sm bg-gray-900 border outline-none border-gray-800"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <button className="bg-gray-800 p-2 w-full mt-4" type="submit">
                  {selectedTableId ? t('editTable') : t('addTable')} 
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Display */}
      {qrCodeUrl && (
        <div className="absolute inset-0 flex justify-center items-center bg-opacity-50 bg-gray-950 z-50">
          <div className="relative bg-gray-900 border border-gray-800 w-full max-w-md p-8 rounded-md flex flex-col items-center">
            <div className="flex justify-between items-center w-full mb-4">
              <RxCross2 size={20} className="cursor-pointer" onClick={() => setQrCodeUrl('')} />
              <span
                className="text-green-600 cursor-pointer"
                onClick={downloadQRCode}
              >{`${t('download')} (${selectedTableName})`}</span>
            </div>
            <h1 className="text-2xl text-center mb-4">{t('scanMe')}</h1>
            <img src={qrCodeUrl} alt="QR Code" className="mb-4" />
            <input
              type="text"
              className="bg-gray-900 border border-gray-800 outline-none p-2 w-full mb-4 text-center"
              value={`${window.location.origin}/info/${userId}/${selectedTableId}`}
              readOnly
            />
            <button className="bg-gray-800 p-2 w-full mb-4" onClick={copyToClipboard}>
              {t('copyUrl')}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteForm && (
        <div className="absolute inset-0 flex justify-center items-center bg-opacity-50 bg-gray-950 z-50">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-md">
            <h1>{t('deleteConfirm', { item: t('table') })}</h1>
            <div className="flex items-center space-x-2 mt-4">
              <button className="bg-gray-800 p-2 w-full" onClick={() => setDeleteForm(false)}>
                {t('cancel')}
              </button>
              <button className="bg-red-800 p-2 w-full" onClick={deleteTable}>
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="bottom-right" />
    </div>
  );
}
